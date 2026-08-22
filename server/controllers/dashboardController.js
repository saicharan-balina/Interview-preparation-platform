// dashboardController.js
// Retrieves stored attempts, computes aggregate stats, handles profile + revision.

const Attempt = require('../models/Attempt');
const User = require('../models/User');
const { calculateOverallScore, average } = require('../services/scoringService');
const { generateRevisionNotes } = require('../services/geminiService');

/**
 * GET /api/dashboard
 * Returns complete dashboard data: scores, topic breakdown, weak areas, recent activity.
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.query.userId || 'demo';
    const attempts = await Attempt.find({ userId }).sort({ createdAt: -1 }).lean();
    
    let user = await User.findOne({}).lean();
    if (!user) {
      user = await User.create({ name: 'Demo User', targetRole: 'Software Engineer', preferredTopics: ['Java', 'DSA', 'DBMS'] });
    }

    // Separate attempts by type (treat type 'mock' as 'interview')
    const practiceAttempts = attempts.filter(a => a.type === 'practice');
    const interviewAttempts = attempts.filter(a => a.type === 'interview' || a.type === 'mock');

    // Calculate averages
    const practiceAvg = average(practiceAttempts.map(a => a.score));
    const interviewAvg = average(interviewAttempts.map(a => a.score));

    // Overall score uses the weighted formula from scoringService (40% practice, 60% interview)
    const overallScore = calculateOverallScore(practiceAvg, interviewAvg);

    // Best score across all attempts
    const allScores = attempts.map(a => a.score).filter(s => s > 0);
    const bestScore = allScores.length ? Math.max(...allScores) : 0;

    // Dynamic list of topics: default presets + any unique custom topics attempted
    const defaultTopics = ['Java', 'DSA', 'DBMS', 'Operating Systems', 'Computer Networks'];
    const attemptTopics = [...new Set(attempts.map(a => a.topic))].filter(Boolean);
    const topics = [...new Set([...defaultTopics, ...attemptTopics])];

    const topicPerformance = topics.map(topic => {
      const topicAttempts = attempts.filter(a => a.topic === topic);
      const topicScores = topicAttempts.map(a => a.score).filter(s => s >= 0); // Include 0 score
      return {
        topic,
        attempts: topicAttempts.length,
        averageScore: average(topicScores),
        sessions: topicAttempts.length
      };
    });

    // Identify weak topics: topics with attempts but avg score < 60
    const weakTopics = topicPerformance
      .filter(t => t.attempts > 0 && t.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore)
      .map(t => t.topic);

    // Recent activity (last 10 attempts)
    const recentActivity = attempts.slice(0, 10).map(a => ({
      type: a.type,
      topic: a.topic,
      score: a.score,
      date: a.createdAt
    }));

    res.json({
      user,
      overallScore,
      practiceAvg,
      interviewAvg,
      bestScore,
      counts: {
        practice: practiceAttempts.length,
        interview: interviewAttempts.length,
        total: attempts.length
      },
      topicPerformance,
      weakTopics,
      recentActivity
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
};

/**
 * GET /api/profile
 * Returns the demo user's profile.
 */
const getProfile = async (req, res) => {
  try {
    let user = await User.findOne({}).lean();
    if (!user) {
      // Create demo user if not exists
      user = await User.create({ name: 'Demo User', targetRole: 'Software Engineer', preferredTopics: ['Java', 'DSA', 'DBMS'] });
    }

    // Include performance stats with profile
    const userId = 'demo';
    const attempts = await Attempt.find({ userId }).lean();
    const scores = attempts.map(a => a.score).filter(s => s > 0);

    res.json({
      ...user,
      stats: {
        totalSessions: attempts.length,
        mockInterviews: attempts.filter(a => a.type === 'mock').length,
        averageScore: average(scores),
        bestScore: scores.length ? Math.max(...scores) : 0
      }
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
};

/**
 * PUT /api/profile
 * Updates the demo user's profile details.
 */
const updateProfile = async (req, res) => {
  try {
    const { name, targetRole, preferredTopics } = req.body;
    let user = await User.findOne({});
    if (!user) {
      user = new User({});
    }
    if (name) user.name = name;
    if (targetRole) user.targetRole = targetRole;
    if (preferredTopics) user.preferredTopics = preferredTopics;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * GET /api/revision?topic=DBMS
 * Returns predefined revision notes for the requested topic.
 * Notes are hardcoded here for reliability within the sprint.
 */
const getRevision = async (req, res) => {
  try {
    const { topic = 'Java' } = req.query;
    const notes = revisionNotes[topic] || { error: `No revision notes for topic: ${topic}` };
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load revision notes' });
  }
};

// ─── REVISION NOTES ─────────────────────────────────────────────────────────
const revisionNotes = {
  Java: {
    topic: 'Java',
    sections: [
      {
        title: 'OOP Pillars',
        content: `• Encapsulation: Binding data and methods; use private fields with getters/setters
• Inheritance: Subclass extends superclass; use "extends" keyword; IS-A relationship
• Polymorphism: Same method, different behavior; overloading (compile-time) + overriding (runtime)
• Abstraction: Hide implementation details; use abstract classes or interfaces`
      },
      {
        title: 'Abstract Class vs Interface',
        content: `• Abstract class: CAN have constructor, instance fields, concrete methods; single inheritance
• Interface (Java 8+): CAN have default/static methods; NO constructor, NO instance state; multiple implementation
• Rule: If "IS-A" → abstract class. If "CAN-DO" → interface`
      },
      {
        title: 'Java Memory Model',
        content: `• Stack: Method calls, local variables, references — per-thread, LIFO
• Heap: All objects, instance variables — shared across threads
• Method Area: Class metadata, static variables
• Garbage Collector: Automatically frees unreachable objects`
      },
      {
        title: 'Exception Handling',
        content: `• Checked: Must handle at compile time (IOException, SQLException)
• Unchecked: Runtime exceptions (NullPointerException, ArrayIndexOutOfBoundsException)
• try-catch-finally: finally always executes
• throws: declares exception; throw: actually throws it`
      },
      {
        title: 'Collections Framework',
        content: `• List: Ordered, allows duplicates → ArrayList (fast read), LinkedList (fast insert/delete)
• Set: No duplicates → HashSet (O(1) ops), TreeSet (sorted), LinkedHashSet (insertion order)
• Map: Key-value pairs → HashMap, TreeMap (sorted), LinkedHashMap (insertion order)
• Queue: FIFO → LinkedList, PriorityQueue`
      }
    ],
    commonQuestions: [
      'What are the 4 pillars of OOP?',
      'Difference between == and .equals() in Java?',
      'What is the difference between ArrayList and LinkedList?',
      'Explain method overloading vs method overriding',
      'What is the difference between final, finally, and finalize?'
    ]
  },
  DSA: {
    topic: 'DSA',
    sections: [
      {
        title: 'Time Complexity Quick Reference',
        content: `• O(1) — HashMap get/put, array index access
• O(log n) — Binary search, balanced BST operations, heap operations
• O(n) — Linear scan, linked list traversal
• O(n log n) — Merge sort, heap sort, efficient sorting algorithms
• O(n²) — Bubble/Selection/Insertion sort, nested loops
• O(2ⁿ) — Recursive Fibonacci (naive), subset generation`
      },
      {
        title: 'Sorting Algorithms',
        content: `• Merge Sort: O(n log n) always, stable, needs O(n) extra space
• Quick Sort: O(n log n) avg, O(n²) worst, in-place, not stable
• Heap Sort: O(n log n) always, in-place, not stable
• Bubble/Selection/Insertion: O(n²) — only use for small or nearly-sorted data
• Use Merge Sort for stability; Quick Sort for cache performance`
      },
      {
        title: 'Graph Algorithms',
        content: `• BFS: Level-by-level; shortest path in unweighted graph; uses Queue
• DFS: Depth-first; cycle detection, topological sort; uses Stack/Recursion
• Dijkstra: Shortest path in weighted (non-negative) graph; uses Min Heap O((V+E) log V)
• Dynamic Programming: Overlapping subproblems + optimal substructure; memoize or tabulate`
      },
      {
        title: 'Dynamic Programming Pattern',
        content: `1. Identify: overlapping subproblems? optimal substructure?
2. Define state: dp[i] means "best result up to index i"
3. Base case: dp[0] or dp[1] 
4. Transition: dp[i] = f(dp[i-1], dp[i-2], ...)
5. Answer: usually dp[n]
Common problems: Fibonacci, 0/1 Knapsack, LCS, LIS, Coin Change`
      }
    ],
    commonQuestions: [
      'Explain the difference between BFS and DFS',
      'What is dynamic programming? Give an example.',
      'How does binary search work? What is its time complexity?',
      'Explain merge sort. When would you prefer it over quick sort?',
      'What is a hash table and how does it handle collisions?'
    ]
  },
  DBMS: {
    topic: 'DBMS',
    sections: [
      {
        title: 'ACID Properties',
        content: `• Atomicity: Transaction is all-or-nothing. If one part fails, entire transaction rolls back.
• Consistency: DB moves from one valid state to another. Constraints are never violated.
• Isolation: Concurrent transactions don't see each other's intermediate states.
  Isolation levels: Read Uncommitted < Read Committed < Repeatable Read < Serializable
• Durability: Once committed, data persists even after system crash (WAL logs).`
      },
      {
        title: 'Normalization',
        content: `• 1NF: Atomic values; no repeating groups; single-valued columns
• 2NF: 1NF + no partial dependency (non-key attribute depends on PART of composite PK)
• 3NF: 2NF + no transitive dependency (non-key attribute depends on another non-key attribute)
• BCNF: Stricter 3NF; every determinant must be a candidate key
Goal: reduce redundancy and update anomalies`
      },
      {
        title: 'SQL Joins',
        content: `• INNER JOIN: Only matching rows in BOTH tables
• LEFT JOIN: ALL rows from left + matching from right (NULL if no match)
• RIGHT JOIN: ALL rows from right + matching from left
• FULL OUTER JOIN: ALL rows from BOTH tables
• CROSS JOIN: Cartesian product (every row × every row)
• SELF JOIN: Join table with itself (e.g., employee-manager)`
      },
      {
        title: 'Indexes',
        content: `• B-Tree Index: Default; good for range queries and equality
• Hash Index: Only equality (=); not useful for BETWEEN, ORDER BY
• Clustered Index: Determines physical order of rows (1 per table)
• Non-clustered: Separate structure with pointer to actual row
• Covering Index: All needed columns are in the index (avoids table lookup)`
      }
    ],
    commonQuestions: [
      'Explain ACID properties with a banking example',
      'What is normalization? Explain 1NF, 2NF, 3NF',
      'Difference between INNER JOIN and LEFT JOIN?',
      'What is a deadlock in DBMS? How is it resolved?',
      'What is an index? When should you NOT use an index?'
    ]
  },
  'Operating Systems': {
    topic: 'Operating Systems',
    sections: [
      {
        title: 'Process vs Thread',
        content: `• Process: Independent program with own address space (code, data, heap, stack)
• Thread: Lightweight unit within a process; shares code, data, heap; own stack + registers
• Context Switch: CPU saves process state (PCB) and loads another — expensive
• Thread switching: Cheaper (shared memory space, less state to save)
• IPC: Pipes, message queues, shared memory, sockets (needed for inter-process communication)`
      },
      {
        title: 'CPU Scheduling Algorithms',
        content: `• FCFS: First Come First Serve; non-preemptive; convoy effect for long jobs
• SJF: Shortest Job First; optimal avg wait; hard to predict burst time
• Round Robin: Fixed time quantum; best for time-sharing; no starvation
• Priority: High priority runs first; can cause starvation (fix: aging)
• MLFQ: Multi-Level Feedback Queue; combines approaches adaptively`
      },
      {
        title: 'Deadlock',
        content: `4 Coffman Conditions (ALL must hold):
1. Mutual Exclusion: Resource held by one process
2. Hold & Wait: Holding resource while waiting for another
3. No Preemption: Resources can't be forcibly taken
4. Circular Wait: Cycle of waiting processes

Prevention: Break any one condition
Detection & Recovery: Allow deadlocks, detect cycle, rollback one process
Avoidance: Banker's Algorithm — only allocate if safe state guaranteed`
      },
      {
        title: 'Memory Management',
        content: `• Paging: Fixed-size blocks (pages); no external fragmentation; page table overhead
• Segmentation: Variable-size segments (code, data, stack); external fragmentation
• Virtual Memory: Pages swapped to disk; page fault triggers load from disk
• TLB (Translation Lookaside Buffer): Cache for page table entries; reduces memory access time
• LRU Page Replacement: Replace least recently used page on page fault`
      }
    ],
    commonQuestions: [
      'Difference between process and thread?',
      'Explain the four conditions for deadlock',
      'Compare FCFS, SJF, and Round Robin scheduling',
      'What is virtual memory? How does paging work?',
      'What is a race condition? How do semaphores prevent it?'
    ]
  },
  'Computer Networks': {
    topic: 'Computer Networks',
    sections: [
      {
        title: 'OSI Model (7 Layers)',
        content: `Mnemonic: "Please Do Not Throw Sausage Pizza Away"
7. Application  — HTTP, FTP, SMTP, DNS (user-facing protocols)
6. Presentation — Encryption, compression, data format
5. Session      — Session management, authentication
4. Transport    — TCP/UDP; end-to-end delivery; port numbers
3. Network      — IP addressing, routing (routers operate here)
2. Data Link    — MAC addresses, error detection, frames (switches)
1. Physical     — Bits, cables, signals, hardware`
      },
      {
        title: 'TCP vs UDP',
        content: `TCP (Transmission Control Protocol):
• Connection-oriented (3-way handshake: SYN → SYN-ACK → ACK)
• Reliable delivery, ordering, flow control, congestion control
• Used: HTTP/S, email, file transfer, SSH

UDP (User Datagram Protocol):
• Connectionless; no handshake
• Fast, low overhead; unreliable (no guarantee)
• Used: DNS, video streaming, gaming, VoIP`
      },
      {
        title: 'HTTP & HTTPS',
        content: `• HTTP: Stateless text protocol; port 80; no encryption
• HTTPS: HTTP + TLS; port 443; encrypted with certificates
• HTTP Methods: GET (read), POST (create), PUT (update), DELETE (delete), PATCH (partial update)
• Status codes: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error)
• REST: Stateless, resource-based URLs, standard HTTP methods`
      },
      {
        title: 'DNS & Routing',
        content: `DNS Resolution order:
Browser cache → OS cache → Recursive Resolver → Root NS → TLD NS → Authoritative NS

IP Addresses:
• IPv4: 32-bit (4 octets), e.g., 192.168.1.1
• IPv6: 128-bit, hex notation
• Subnet mask: Separates network from host portion
• CIDR: /24 = 255.255.255.0 = 256 addresses`
      }
    ],
    commonQuestions: [
      'Explain the TCP three-way handshake',
      'What is the difference between TCP and UDP?',
      'What happens when you type a URL in a browser?',
      'Explain the OSI model with examples at each layer',
      'What is DNS and how does it resolve domain names?'
    ]
  }
};

module.exports = { getDashboard, getProfile, updateProfile, getRevision, generateAIRevision };

/**
 * POST /api/dashboard/revision/generate
 * Body: { topic }
 * Calls Gemini to generate comprehensive revision notes for any topic.
 */
async function generateAIRevision(req, res) {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) return res.status(400).json({ error: 'Topic is required' });
    const notes = await generateRevisionNotes(topic.trim());
    res.json(notes);
  } catch (err) {
    console.error('generateAIRevision error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate revision notes' });
  }
}
