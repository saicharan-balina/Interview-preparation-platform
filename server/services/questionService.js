// questionService.js
// Responsible for the predefined question bank.
// A reliable static bank is used instead of AI question generation
// to keep the system explainable and reliable within the sprint.

const Question = require('../models/Question');

// ─────────────────────────────────────────────────────────────
// PREDEFINED QUESTION BANK
// Topics: Java, DSA, DBMS, Operating Systems, Computer Networks
// ─────────────────────────────────────────────────────────────
const questionBank = [
  // ─── JAVA ───────────────────────────────────────────────────
  {
    topic: 'Java', type: 'mcq', difficulty: 'medium',
    question: 'Which of the following best describes polymorphism in Java?',
    options: ['A class can extend multiple classes', 'One interface can have multiple implementations', 'A single method name can behave differently based on the object', 'Variables can hold multiple data types simultaneously'],
    correctAnswer: 'A single method name can behave differently based on the object',
    explanation: 'Polymorphism means "many forms." In Java, a method or object can behave differently depending on the context — achieved through method overloading (compile-time) and method overriding (runtime).'
  },
  {
    topic: 'Java', type: 'mcq', difficulty: 'easy',
    question: 'What is the output of: System.out.println(10 / 3) in Java?',
    options: ['3.33', '3', '3.0', 'Compile error'],
    correctAnswer: '3',
    explanation: 'In Java, integer division truncates the decimal. 10 / 3 = 3 (integer). To get 3.33, cast: (double) 10 / 3.'
  },
  {
    topic: 'Java', type: 'mcq', difficulty: 'medium',
    question: 'Which keyword prevents a method from being overridden in Java?',
    options: ['static', 'private', 'final', 'abstract'],
    correctAnswer: 'final',
    explanation: 'The final keyword on a method prevents subclasses from overriding it. final on a class prevents inheritance entirely.'
  },
  {
    topic: 'Java', type: 'mcq', difficulty: 'hard',
    question: 'What is the difference between an abstract class and an interface in Java 8+?',
    options: [
      'Abstract classes can have constructors; interfaces cannot have any methods with bodies',
      'Interfaces can have default methods with bodies; abstract classes can have constructors and instance state',
      'There is no practical difference in Java 8',
      'Abstract classes support multiple inheritance; interfaces do not'
    ],
    correctAnswer: 'Interfaces can have default methods with bodies; abstract classes can have constructors and instance state',
    explanation: 'Java 8 added default and static methods to interfaces. The key distinction: abstract classes can have constructors and instance fields; interfaces cannot have constructors or mutable instance state.'
  },
  {
    topic: 'Java', type: 'mcq', difficulty: 'medium',
    question: 'What does the synchronized keyword do in Java?',
    options: ['Makes a method run faster', 'Ensures only one thread can execute a block at a time', 'Prevents garbage collection', 'Marks a method as deprecated'],
    correctAnswer: 'Ensures only one thread can execute a block at a time',
    explanation: 'synchronized ensures mutual exclusion — only one thread can hold the lock and execute the synchronized block/method at any time, preventing race conditions.'
  },
  {
    topic: 'Java', type: 'interview', difficulty: 'medium',
    question: 'Explain the four pillars of Object-Oriented Programming in Java with examples.',
    options: [], correctAnswer: '', explanation: ''
  },
  {
    topic: 'Java', type: 'interview', difficulty: 'hard',
    question: 'What is the Java Memory Model? Explain heap vs stack memory.',
    options: [], correctAnswer: '', explanation: ''
  },

  // ─── DSA ─────────────────────────────────────────────────────
  {
    topic: 'DSA', type: 'mcq', difficulty: 'easy',
    question: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctAnswer: 'O(log n)',
    explanation: 'Binary search halves the search space each step. Starting with n elements: n → n/2 → n/4 → ... → 1. This takes log₂(n) steps → O(log n).'
  },
  {
    topic: 'DSA', type: 'mcq', difficulty: 'medium',
    question: 'Which data structure uses LIFO (Last In, First Out) order?',
    options: ['Queue', 'Stack', 'Heap', 'Linked List'],
    correctAnswer: 'Stack',
    explanation: 'A Stack follows LIFO — the last element pushed is the first to be popped. Used in function call stacks, undo operations, and expression evaluation.'
  },
  {
    topic: 'DSA', type: 'mcq', difficulty: 'medium',
    question: 'What is the worst-case time complexity of QuickSort?',
    options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    correctAnswer: 'O(n²)',
    explanation: 'QuickSort worst case occurs when the pivot is always the smallest or largest element (e.g., sorted array with bad pivot choice), leading to O(n²). Average case is O(n log n).'
  },
  {
    topic: 'DSA', type: 'mcq', difficulty: 'hard',
    question: 'In a min-heap, what is the time complexity of extracting the minimum element?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 'O(log n)',
    explanation: 'Extracting the min removes the root (O(1) to get it) but then requires heapify-down to restore the heap property, which takes O(log n) since the tree height is log n.'
  },
  {
    topic: 'DSA', type: 'mcq', difficulty: 'medium',
    question: 'Which algorithm is best suited for finding the shortest path in an unweighted graph?',
    options: ['DFS', 'BFS', 'Dijkstra', 'Bellman-Ford'],
    correctAnswer: 'BFS',
    explanation: 'BFS explores level by level. In an unweighted graph, the first time BFS reaches a node, it is via the shortest path (fewest edges). Dijkstra works for weighted graphs.'
  },
  {
    topic: 'DSA', type: 'interview', difficulty: 'medium',
    question: 'Explain the difference between BFS and DFS. When would you use each?',
    options: [], correctAnswer: '', explanation: ''
  },
  {
    topic: 'DSA', type: 'interview', difficulty: 'hard',
    question: 'What is dynamic programming? Explain with the Fibonacci example.',
    options: [], correctAnswer: '', explanation: ''
  },

  // ─── DBMS ────────────────────────────────────────────────────
  {
    topic: 'DBMS', type: 'mcq', difficulty: 'easy',
    question: 'What does ACID stand for in database transactions?',
    options: [
      'Atomicity, Consistency, Isolation, Durability',
      'Availability, Consistency, Integrity, Durability',
      'Atomicity, Concurrency, Isolation, Distribution',
      'Availability, Concurrency, Integrity, Distribution'
    ],
    correctAnswer: 'Atomicity, Consistency, Isolation, Durability',
    explanation: 'ACID properties guarantee reliable database transactions: Atomicity (all-or-nothing), Consistency (valid state before/after), Isolation (concurrent transactions don\'t interfere), Durability (committed data persists).'
  },
  {
    topic: 'DBMS', type: 'mcq', difficulty: 'medium',
    question: 'What is a primary key in a relational database?',
    options: [
      'Any column with unique values',
      'A column or set of columns that uniquely identifies each row and cannot be NULL',
      'The first column of every table',
      'A foreign key that references another table'
    ],
    correctAnswer: 'A column or set of columns that uniquely identifies each row and cannot be NULL',
    explanation: 'A primary key uniquely identifies each record. It enforces entity integrity: values must be unique and NOT NULL. A table can have only one primary key.'
  },
  {
    topic: 'DBMS', type: 'mcq', difficulty: 'hard',
    question: 'What is the difference between 2NF and 3NF normalization?',
    options: [
      '2NF removes partial dependencies; 3NF removes transitive dependencies',
      '2NF removes transitive dependencies; 3NF removes partial dependencies',
      '2NF handles multi-valued attributes; 3NF handles join dependencies',
      'There is no practical difference'
    ],
    correctAnswer: '2NF removes partial dependencies; 3NF removes transitive dependencies',
    explanation: '2NF: No non-key attribute should depend on PART of a composite primary key (removes partial dependency). 3NF: No non-key attribute should depend on another non-key attribute (removes transitive dependency).'
  },
  {
    topic: 'DBMS', type: 'mcq', difficulty: 'medium',
    question: 'What is a deadlock in database systems?',
    options: [
      'A query that runs too slowly',
      'A situation where two or more transactions wait for each other\'s locks indefinitely',
      'A corrupted database index',
      'A failed database connection'
    ],
    correctAnswer: 'A situation where two or more transactions wait for each other\'s locks indefinitely',
    explanation: 'Deadlock: Transaction A holds lock on Resource 1 and waits for Resource 2. Transaction B holds lock on Resource 2 and waits for Resource 1. Neither can proceed. DBMS detects and resolves by rolling back one transaction.'
  },
  {
    topic: 'DBMS', type: 'mcq', difficulty: 'medium',
    question: 'What is the difference between INNER JOIN and LEFT JOIN?',
    options: [
      'INNER JOIN returns all rows from both tables; LEFT JOIN returns only matching rows',
      'INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table plus matching rows from the right',
      'They are the same; just different syntax',
      'LEFT JOIN is faster than INNER JOIN'
    ],
    correctAnswer: 'INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table plus matching rows from the right',
    explanation: 'INNER JOIN: only rows with matches in BOTH tables. LEFT JOIN: ALL rows from left table; NULL for right table columns where no match exists.'
  },
  {
    topic: 'DBMS', type: 'interview', difficulty: 'medium',
    question: 'Explain ACID properties in database transactions with a real-world banking example.',
    options: [], correctAnswer: '', explanation: ''
  },

  // ─── OPERATING SYSTEMS ───────────────────────────────────────
  {
    topic: 'Operating Systems', type: 'mcq', difficulty: 'easy',
    question: 'What is a process in an operating system?',
    options: [
      'A program stored on disk',
      'A program in execution with its own memory space',
      'A thread inside a program',
      'A CPU scheduling algorithm'
    ],
    correctAnswer: 'A program in execution with its own memory space',
    explanation: 'A process is a program loaded into memory and executing. It has its own address space, code, data, heap, and stack. Multiple processes are isolated from each other by the OS.'
  },
  {
    topic: 'Operating Systems', type: 'mcq', difficulty: 'medium',
    question: 'What is the difference between a process and a thread?',
    options: [
      'Processes share memory; threads do not',
      'Threads share the process address space; processes have independent memory',
      'A thread can contain multiple processes',
      'They are the same thing'
    ],
    correctAnswer: 'Threads share the process address space; processes have independent memory',
    explanation: 'Threads within the same process share code, data, and heap segments but each has its own stack and registers. Processes are fully isolated — communication requires IPC mechanisms.'
  },
  {
    topic: 'Operating Systems', type: 'mcq', difficulty: 'medium',
    question: 'What scheduling algorithm gives each process a fixed time slice in a round-robin fashion?',
    options: ['FCFS', 'Round Robin', 'Priority Scheduling', 'Shortest Job First'],
    correctAnswer: 'Round Robin',
    explanation: 'Round Robin assigns each process a time quantum. When the quantum expires, the process is moved to the back of the ready queue. Good for time-sharing systems — prevents starvation.'
  },
  {
    topic: 'Operating Systems', type: 'mcq', difficulty: 'hard',
    question: 'What are the four necessary conditions for a deadlock?',
    options: [
      'Mutual exclusion, Hold and wait, No preemption, Circular wait',
      'Starvation, Aging, Priority inversion, Circular dependency',
      'Race condition, Critical section, Semaphore, Monitor',
      'Paging, Segmentation, Swapping, Fragmentation'
    ],
    correctAnswer: 'Mutual exclusion, Hold and wait, No preemption, Circular wait',
    explanation: 'Coffman conditions (all four must hold simultaneously): 1) Mutual Exclusion — resource held by one process, 2) Hold and Wait — holding while waiting, 3) No Preemption — resources can\'t be forcibly taken, 4) Circular Wait — circular chain of waiting.'
  },
  {
    topic: 'Operating Systems', type: 'mcq', difficulty: 'medium',
    question: 'What is virtual memory?',
    options: [
      'RAM installed in the motherboard',
      'An abstraction that allows processes to use more memory than physically available by using disk space',
      'A CPU cache',
      'Memory shared between all processes'
    ],
    correctAnswer: 'An abstraction that allows processes to use more memory than physically available by using disk space',
    explanation: 'Virtual memory gives each process its own large address space. Pages not in RAM are swapped to disk (page file). Page faults trigger loading from disk. Managed by the MMU and OS.'
  },
  {
    topic: 'Operating Systems', type: 'interview', difficulty: 'medium',
    question: 'Explain CPU scheduling algorithms. Compare FCFS, SJF, and Round Robin.',
    options: [], correctAnswer: '', explanation: ''
  },

  // ─── COMPUTER NETWORKS ────────────────────────────────────────
  {
    topic: 'Computer Networks', type: 'mcq', difficulty: 'easy',
    question: 'What does HTTP stand for and what protocol does HTTPS add?',
    options: [
      'HyperText Transfer Protocol; adds FTP encryption',
      'HyperText Transfer Protocol; adds TLS/SSL encryption',
      'Hybrid Transfer Protocol; adds TCP security',
      'HyperText Transmission Protocol; adds UDP security'
    ],
    correctAnswer: 'HyperText Transfer Protocol; adds TLS/SSL encryption',
    explanation: 'HTTP is the foundation of data communication on the web. HTTPS adds TLS (Transport Layer Security) — formerly SSL — to encrypt communication between client and server.'
  },
  {
    topic: 'Computer Networks', type: 'mcq', difficulty: 'medium',
    question: 'What is the difference between TCP and UDP?',
    options: [
      'TCP is faster; UDP is more reliable',
      'TCP is connection-oriented and reliable; UDP is connectionless and faster but unreliable',
      'UDP guarantees delivery; TCP does not',
      'They operate at different network layers'
    ],
    correctAnswer: 'TCP is connection-oriented and reliable; UDP is connectionless and faster but unreliable',
    explanation: 'TCP: 3-way handshake, guaranteed delivery, ordering, error checking — used for HTTP, email. UDP: no connection, no guarantee, low overhead — used for video streaming, DNS, gaming.'
  },
  {
    topic: 'Computer Networks', type: 'mcq', difficulty: 'medium',
    question: 'What is the OSI model and how many layers does it have?',
    options: ['5 layers', '4 layers', '7 layers', '6 layers'],
    correctAnswer: '7 layers',
    explanation: '7 layers (mnemonic: Please Do Not Throw Sausage Pizza Away): Physical, Data Link, Network, Transport, Session, Presentation, Application. Each layer handles a specific aspect of network communication.'
  },
  {
    topic: 'Computer Networks', type: 'mcq', difficulty: 'hard',
    question: 'What happens when you type a URL in a browser and press Enter?',
    options: [
      'Browser directly connects to the web server IP',
      'DNS resolves domain to IP → TCP 3-way handshake → TLS handshake → HTTP request → response → render',
      'The browser asks the ISP for the website content directly',
      'URL is sent to a central internet server for routing'
    ],
    correctAnswer: 'DNS resolves domain to IP → TCP 3-way handshake → TLS handshake → HTTP request → response → render',
    explanation: 'Full flow: 1) DNS lookup (cache → recursive resolver → authoritative NS), 2) TCP 3-way handshake, 3) TLS handshake (for HTTPS), 4) HTTP GET request, 5) Server responds with HTML, 6) Browser parses and renders.'
  },
  {
    topic: 'Computer Networks', type: 'mcq', difficulty: 'medium',
    question: 'What is the purpose of a subnet mask?',
    options: [
      'To encrypt network traffic',
      'To determine which portion of an IP address identifies the network vs the host',
      'To assign IP addresses automatically',
      'To filter unwanted network packets'
    ],
    correctAnswer: 'To determine which portion of an IP address identifies the network vs the host',
    explanation: 'A subnet mask (e.g., 255.255.255.0) ANDed with an IP address separates the network address from the host address. Used for routing decisions and network segmentation.'
  },
  {
    topic: 'Computer Networks', type: 'interview', difficulty: 'medium',
    question: 'Explain the TCP three-way handshake and why it is necessary.',
    options: [], correctAnswer: '', explanation: ''
  }
];

/**
 * Seeds the question bank into MongoDB if not already done.
 * Called once from server.js after DB connection.
 */
const seedQuestions = async () => {
  try {
    const count = await Question.countDocuments();
    if (count === 0) {
      await Question.insertMany(questionBank);
      console.log(`✅ Question bank seeded: ${questionBank.length} questions`);
    }
  } catch (err) {
    console.error('❌ Failed to seed questions:', err.message);
  }
};

/**
 * Returns MCQ questions for the given topic.
 * Shuffles the array and returns up to `count` questions.
 */
const getQuestions = async (topic, count = 5) => {
  const questions = await Question.find({ topic, type: 'mcq' }).lean();
  // Shuffle for variety
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Returns interview questions for the given topic.
 */
const getInterviewQuestions = async (topic, count = 3) => {
  const questions = await Question.find({ topic, type: 'interview' }).lean();
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

module.exports = { seedQuestions, getQuestions, getInterviewQuestions, questionBank };
