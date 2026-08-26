// Main Menu Keyboard
export const MAIN_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🎓 Drone Training", callback_data: "menu:training" },
      { text: "🚁 Aerial Services", callback_data: "menu:services" }
    ],
    [
      { text: "🔬 Research & Tech", callback_data: "menu:research" },
      { text: "📞 Contact & Info", callback_data: "menu:contact" }
    ]
  ]
};

// Training Sub-menu Keyboard
export const TRAINING_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "📚 View Courses", callback_data: "prompt:courses" },
      { text: "✍️ Register Now", callback_data: "prompt:register" }
    ],
    [
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

// Services Sub-menu Keyboard
export const SERVICES_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "⛏ Mining & Survey", callback_data: "prompt:mining" },
      { text: "🏗 AEC & Infrastructure", callback_data: "prompt:aec" }
    ],
    [
      { text: "🌾 Agriculture", callback_data: "prompt:agriculture" },
      { text: "🌊 Disaster & Security", callback_data: "prompt:disaster" }
    ],
    [
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

// Research & Tech Sub-menu Keyboard
export const RESEARCH_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "✈️ AHUODEN Project", callback_data: "prompt:ahuoden" },
      { text: "📡 Tracking & Software", callback_data: "prompt:tracking" }
    ],
    [
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

// Contact & Info Sub-menu Keyboard
export const CONTACT_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "📍 Location & Hours", callback_data: "prompt:location" },
      { text: "☎️ Phone & Web", callback_data: "prompt:phone" }
    ],
    [
      { text: "🔗 Social Media", callback_data: "prompt:social" },
      { text: "🎓 Internship", callback_data: "prompt:internship" }
    ],
    [
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

// Dynamic Context-based Follow-up Keyboards
export const TRAINING_FOLLOWUP_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "📚 View Courses", callback_data: "prompt:courses" },
      { text: "✍️ Register Now", callback_data: "prompt:register" }
    ],
    [
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

export const SERVICES_FOLLOWUP_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "⛏ Mining & Survey", callback_data: "prompt:mining" },
      { text: "🏗 AEC & Infrastructure", callback_data: "prompt:aec" }
    ],
    [
      { text: "🌾 Agriculture", callback_data: "prompt:agriculture" },
      { text: "🌊 Disaster & Security", callback_data: "prompt:disaster" }
    ],
    [
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

export const RESEARCH_FOLLOWUP_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "✈️ AHUODEN Project", callback_data: "prompt:ahuoden" },
      { text: "📡 Tracking & Software", callback_data: "prompt:tracking" }
    ],
    [
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

export const CONTACT_FOLLOWUP_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "📍 Location & Hours", callback_data: "prompt:location" },
      { text: "☎️ Phone & Web", callback_data: "prompt:phone" }
    ],
    [
      { text: "🔗 Social Media", callback_data: "prompt:social" },
      { text: "🎓 Internship", callback_data: "prompt:internship" }
    ],
    [
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

// Internship Follow-up Keyboard
export const INTERNSHIP_FOLLOWUP_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "📍 Our Location", callback_data: "prompt:location" },
      { text: "☎️ Contact Us", callback_data: "prompt:phone" }
    ],
    [
      { text: "🎓 Drone Training", callback_data: "menu:training" },
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

// General fallback follow-up keyboard (for typed messages)
export const GENERAL_FOLLOWUP_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🔍 Explain Further", callback_data: "prompt:explain_further" },
      { text: "💡 Give Me an Example", callback_data: "prompt:give_example" }
    ],
    [
      { text: "📞 Contact Soko", callback_data: "menu:contact" },
      { text: "🏠 Main Menu", callback_data: "menu:main" }
    ]
  ]
};

/**
 * Returns the keyboard for a specific menu state.
 */
export function getKeyboardForMenu(menuState: string): any {
  switch (menuState) {
    case "training":
      return TRAINING_KEYBOARD;
    case "services":
      return SERVICES_KEYBOARD;
    case "research":
      return RESEARCH_KEYBOARD;
    case "contact":
      return CONTACT_KEYBOARD;
    case "main":
    default:
      return MAIN_KEYBOARD;
  }
}

/**
 * Returns the contextual follow-up keyboard based on the active topic.
 */
export function getKeyboardForTopic(topic?: string): any {
  switch (topic) {
    case "training":
      return TRAINING_FOLLOWUP_KEYBOARD;
    case "services":
      return SERVICES_FOLLOWUP_KEYBOARD;
    case "research":
      return RESEARCH_FOLLOWUP_KEYBOARD;
    case "contact":
      return CONTACT_FOLLOWUP_KEYBOARD;
    case "internship":
      return INTERNSHIP_FOLLOWUP_KEYBOARD;
    default:
      return GENERAL_FOLLOWUP_KEYBOARD;
  }
}

/**
 * Prompt mappings for shortcuts (buttons mapped to direct AI questions or static replies).
 */
export const PROMPT_MAPPINGS: Record<string, string> = {
  courses: "What drone training courses and programs does Soko Aerial offer?",
  mining: "Tell me about Soko Aerial's drone services for the mining industry.",
  aec: "Tell me about Soko Aerial's drone services for AEC (Architecture, Engineering, Construction) and Infrastructure inspection.",
  agriculture: "How does Soko Aerial use drones in agriculture?",
  disaster: "Tell me about Soko Aerial's disaster data management and security surveillance capabilities.",
  ahuoden: "What is the AHUODEN surveillance drone project?",
  tracking: "What software, offline tracking, and ground control systems has Soko Aerial developed?",
  location: "Where is Soko Aerial located and what are their contact details?",
  phone: "What are Soko Aerial's phone numbers and official website?",
  social: "What are Soko Aerial's social media handles and channels?",
  internship: "Does Soko Aerial accept interns? How does the internship application process work and what areas can interns learn?",
  explain_further: "Can you explain that in more detail?",
  give_example: "Can you give me a specific example or case study from the knowledge base related to that?"
};
