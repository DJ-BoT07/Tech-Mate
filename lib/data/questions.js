export const initialQuestions = {
  frontend: [
    {
      question: "What is the virtual representation of DOM that React uses for performance optimization?",
      answer: "VirtualDOM",
      hints: ["Think about React's rendering optimization", "It's a concept related to DOM manipulation", "Starts with 'virtual'"],
      techStack: "frontend"
    },
    {
      question: "Which CSS layout system is specifically designed for one-dimensional content flow?", 
      answer: "Flexbox",
      hints: ["Related to CSS layout systems", "Compare modern layout approaches", "One is 1D, other is 2D"],
      techStack: "frontend"
    },
    {
      question: "What React hook is used for side effects in functional components?",
      answer: "useEffect",
      hints: ["It's a built-in hook", "Handles component lifecycle", "Deals with side effects"],
      techStack: "frontend"
    },
    {
      question: "What is the state management library commonly used with React?",
      answer: "Redux",
      hints: ["Popular state management", "Uses actions and reducers", "Think global state"],
      techStack: "frontend"
    },
    {
      question: "What CSS Grid property defines the size of columns?",
      answer: "gridTemplateColumns",
      hints: ["Grid layout property", "Defines column widths", "Template for columns"],
      techStack: "frontend"
    },
    {
      question: "What hook is used to access React context?",
      answer: "useContext",
      hints: ["Accesses context", "Hook for shared data", "Context consumer"],
      techStack: "frontend"
    }
  ],
  backend: [
    {
      question: "What database optimization technique improves the speed of data retrieval operations?",
      answer: "Indexing",
      hints: ["Think about database performance", "Similar to a book's index", "Helps in faster data retrieval"],
      techStack: "backend"
    },
    {
      question: "What is the technique of breaking a database into smaller, more manageable pieces?",
      answer: "Sharding",
      hints: ["Related to database scaling", "Involves breaking things into pieces", "Helps with large datasets"],
      techStack: "backend"
    },
    {
      question: "What pattern is used to handle asynchronous operations in modern JavaScript?",
      answer: "Promises",
      hints: ["Handles async code", "Alternative to callbacks", "Resolves or rejects"],
      techStack: "backend"
    },
    {
      question: "What is the architectural style for building web services that use HTTP methods?",
      answer: "REST",
      hints: ["Common API architecture", "Uses HTTP methods", "Representational State Transfer"],
      techStack: "backend"
    },
    {
      question: "What NoSQL database is known for its document-oriented structure?",
      answer: "MongoDB",
      hints: ["Document database", "NoSQL solution", "Stores BSON documents"],
      techStack: "backend"
    },
    {
      question: "What is the process of combining multiple database tables?",
      answer: "Join",
      hints: ["SQL operation", "Combines tables", "Relates data"],
      techStack: "backend"
    }
  ],
  fullstack: [
    {
      question: "What authentication mechanism uses encoded tokens for secure client-server communication?",
      answer: "JWT",
      hints: ["Token-based auth", "JSON format", "Three parts separated by dots"],
      techStack: "fullstack"
    },
    {
      question: "What is the process of converting data structures into a format suitable for transmission?",
      answer: "Serialization",
      hints: ["Data transformation", "Network communication", "Object to string conversion"],
      techStack: "fullstack"
    },
    {
      question: "What architectural pattern separates business logic from presentation?",
      answer: "MVC",
      hints: ["Common design pattern", "Three main components", "Separates concerns"],
      techStack: "fullstack"
    },
    {
      question: "What is the standard format for API data exchange?",
      answer: "JSON",
      hints: ["Data format", "JavaScript Object Notation", "Key-value pairs"],
      techStack: "fullstack"
    }
  ],
  mobile: [
    {
      question: "What framework by Meta allows cross-platform mobile development using JavaScript?",
      answer: "ReactNative",
      hints: ["Cross-platform development", "Related to React", "Native mobile apps"],
      techStack: "mobile"
    },
    {
      question: "What is Google's programming language for Android development?",
      answer: "Kotlin",
      hints: ["Android development", "JVM language", "Google's preferred choice"],
      techStack: "mobile"
    },
    {
      question: "What is Apple's new programming language for iOS development?",
      answer: "Swift",
      hints: ["iOS development", "Replaced Objective-C", "Named after a bird"],
      techStack: "mobile"
    },
    {
      question: "What framework is used for cross-platform development with a single codebase?",
      answer: "Flutter",
      hints: ["Google framework", "Dart language", "Material Design"],
      techStack: "mobile"
    }
  ],
  devops: [
    {
      question: "What technology enables application packaging with all its dependencies?",
      answer: "Docker",
      hints: ["Container technology", "Portable environments", "Think shipping containers"],
      techStack: "devops"
    },
    {
      question: "What tool orchestrates container deployment and scaling?",
      answer: "Kubernetes",
      hints: ["Container orchestration", "Originally by Google", "Often abbreviated as K8s"],
      techStack: "devops"
    },
    {
      question: "What practice involves automatically deploying code changes to production?",
      answer: "CD",
      hints: ["Automation practice", "Part of CI/CD", "Continuous ___"],
      techStack: "devops"
    },
    {
      question: "What tool is used for infrastructure as code?",
      answer: "Terraform",
      hints: ["Infrastructure automation", "HashiCorp product", "Declarative language"],
      techStack: "devops"
    }
  ],
  ai: [
    {
      question: "What optimization algorithm helps minimize the loss function in machine learning?",
      answer: "GradientDescent",
      hints: ["Optimization algorithm", "Minimizes loss", "Step by step approach"],
      techStack: "ai"
    },
    {
      question: "What type of neural network is commonly used for image recognition?",
      answer: "CNN",
      hints: ["Neural network type", "Good for images", "Convolutional ___"],
      techStack: "ai"
    },
    {
      question: "What technique helps prevent overfitting in machine learning models?",
      answer: "Regularization",
      hints: ["Prevents overfitting", "Model complexity", "Adds constraints"],
      techStack: "ai"
    },
    {
      question: "What type of learning occurs when a model learns from labeled data?",
      answer: "Supervised",
      hints: ["Learning type", "Uses labeled data", "Known outputs"],
      techStack: "ai"
    }
  ]
};