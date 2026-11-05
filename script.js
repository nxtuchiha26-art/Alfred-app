/* =========================================================
   ALFRED 2.0 — SPECIALIST DEPARTMENT SYSTEM
   Complete JS replacement
   Existing HTML + CSS preserved
========================================================= */

(() => {
  "use strict";

  if (window.__ALFRED_20_INITIALISED__) return;
  window.__ALFRED_20_INITIALISED__ = true;

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const DB_KEY = "alfred_20_database";
  const PROFILE_KEY = "alfred_20_profile";
  const AI_KEY = "alfred_20_ai_mode";

  const read = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };

  let db = read(DB_KEY, {});
  let profile = read(PROFILE_KEY, { username: "Bruce", photo: "" });
  let activeDepartment = null;
  let activeTool = null;
  let searchTerm = "";
  let activeFilter = "all";
  let aiMode = localStorage.getItem(AI_KEY) || "General Assistant";

  const save = () => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch {
      alert("Storage is full. Please export or remove some records.");
    }
  };

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[c]);

  const keyFor = (dept, tool) => `${dept}::${tool}`;

  function records(dept = activeDepartment, tool = activeTool) {
    const value = db[keyFor(dept, tool)];
    return Array.isArray(value) ? value : [];
  }

  function setRecords(items, dept = activeDepartment, tool = activeTool) {
    db[keyFor(dept, tool)] = items;
    save();
  }

  /* ---------------------------------------------------------
     01 — DEPARTMENTS
  --------------------------------------------------------- */

  const departments = {
    academics: {
      name: "Academics",
      description: "Academic command and learning management.",
      tools: [
        "Subjects", "Assignments", "Study Planner", "AI Tutor",
        "Notes", "Library", "Flashcards", "Exam Countdown"
      ]
    },
    fitness: {
      name: "Fitness & Performance",
      description: "Athletic training and performance management.",
      tools: [
        "Workout Log", "Boxing Tracker", "Exercise Library",
        "Recovery", "Performance Goals", "AI Coach"
      ]
    },
    nutrition: {
      name: "Nutrition & Wellness",
      description: "Nutrition, hydration and general wellness.",
      tools: [
        "Meal Journal", "Hydration", "Nutrition Guide",
        "Wellness Journal", "Sleep Tracker", "AI Wellness Assistant"
      ]
    },
    business: {
      name: "Business & Enterprise",
      description: "Business operations and enterprise development.",
      tools: [
        "Customers", "Products", "Orders", "Finance Ledger",
        "Ideas Vault", "Business Academy", "AI Business Strategist"
      ]
    },
    operations: {
      name: "Daily Operations",
      description: "Daily execution and personal organisation.",
      tools: [
        "Tasks", "Daily Planner", "Routines", "Reminders",
        "Journal", "Focus Mode", "Time Management"
      ]
    },
    personal: {
      name: "Personal Command",
      description: "Personal standards, goals and development.",
      tools: [
        "Personal Profile", "Daily Briefing", "Goals & Vision",
        "Habit Tracker", "Rules & Standards", "Decision Journal",
        "Personal Review"
      ]
    },
    skills: {
      name: "Skill Development",
      description: "Learning roadmaps and skill progression.",
      tools: [
        "Skill Library", "Learning Roadmap", "Practice Tracker",
        "Projects & Portfolio", "Resource Vault",
        "Progress Analytics", "AI Skill Coach"
      ]
    },
    finance: {
      name: "Finance & Assets",
      description: "Savings, assets and financial education.",
      tools: [
        "Income Tracker", "Expense Tracker", "Savings Vault",
        "Asset Register", "Financial Goals",
        "Financial Knowledge", "AI Finance Advisor"
      ]
    },
    knowledge: {
      name: "Knowledge Vault",
      description: "Research, notes and information archive.",
      tools: [
        "Quick Notes", "Research Library", "Book Library",
        "Learning Archive", "Reference Vault", "Knowledge Search"
      ]
    },
    missions: {
      name: "Mission Control",
      description: "Objectives, milestones and mission reviews.",
      tools: [
        "Mission Log", "Objectives", "Milestones",
        "After-Action Review"
      ]
    },
    lifestyle: {
      name: "Lifestyle & Wardrobe",
      description: "Wardrobe and personal lifestyle management.",
      tools: [
        "Wardrobe Collection", "Outfit Builder", "Style Journal",
        "Accessories Vault", "Fragrance Collection", "Shopping Wishlist",
        "AI Style Advisor"
      ]
    }
  };

  /* ---------------------------------------------------------
     02 — TOOL-SPECIFIC FIELD DEFINITIONS
  --------------------------------------------------------- */

  const F = (name, label, type = "text", options = []) =>
    ({ name, label, type, options });

  const fields = {
    academics: {
      Subjects: [
        F("name", "Subject name"),
        F("teacher", "Teacher"),
        F("chapters", "Chapters / topics"),
        F("level", "Current confidence", "select", ["Needs work", "Developing", "Good", "Strong"]),
        F("notes", "Additional notes", "textarea")
      ],
      Assignments: [
        F("title", "Assignment"),
        F("subject", "Subject"),
        F("due", "Due date", "date"),
        F("priority", "Priority", "select", ["Low", "Normal", "High"]),
        F("status", "Status", "select", ["Not started", "In progress", "Completed"]),
        F("notes", "Instructions / notes", "textarea")
      ],
      "Study Planner": [
        F("title", "Study session"),
        F("subject", "Subject"),
        F("date", "Study date", "date"),
        F("start", "Start time", "time"),
        F("duration", "Duration (minutes)", "number"),
        F("topic", "Topics to cover", "textarea")
      ],
      "AI Tutor": [
        F("topic", "Topic to learn"),
        F("subject", "Subject"),
        F("level", "Difficulty", "select", ["Beginner", "Intermediate", "Advanced"]),
        F("question", "What are you struggling with?", "textarea")
      ],
      Notes: [
        F("title", "Note title"),
        F("subject", "Subject"),
        F("category", "Category"),
        F("content", "Your notes", "textarea")
      ],
      Library: [
        F("title", "Book / resource title"),
        F("author", "Author / creator"),
        F("category", "Subject / category"),
        F("link", "Resource link", "url"),
        F("notes", "Notes", "textarea")
      ],
      Flashcards: [
        F("question", "Question / front"),
        F("answer", "Answer / back", "textarea"),
        F("subject", "Subject"),
        F("difficulty", "Difficulty", "select", ["Easy", "Medium", "Hard"])
      ],
      "Exam Countdown": [
        F("title", "Exam name"),
        F("subject", "Subject"),
        F("date", "Exam date", "date"),
        F("syllabus", "Syllabus / chapters", "textarea")
      ]
    },

    fitness: {
      "Workout Log": [
        F("title", "Workout name"),
        F("category", "Training type", "select", ["Strength", "Calisthenics", "Conditioning", "Mobility", "Boxing"]),
        F("date", "Training date", "date"),
        F("duration", "Duration (minutes)", "number"),
        F("exercises", "Exercises / sets", "textarea"),
        F("notes", "Performance notes", "textarea")
      ],
      "Boxing Tracker": [
        F("title", "Session name"),
        F("date", "Session date", "date"),
        F("rounds", "Rounds", "number"),
        F("roundLength", "Round length (minutes)", "number"),
        F("focus", "Session focus", "select", ["Footwork", "Technique", "Defence", "Combinations", "Conditioning", "Sparring"]),
        F("notes", "Observations", "textarea")
      ],
      "Exercise Library": [
        F("name", "Exercise"),
        F("muscle", "Main area"),
        F("category", "Exercise type"),
        F("equipment", "Equipment"),
        F("instructions", "Technique notes", "textarea")
      ],
      Recovery: [
        F("date", "Date", "date"),
        F("sleep", "Sleep (hours)", "number"),
        F("energy", "Energy level", "select", ["Low", "Moderate", "Good", "High"]),
        F("soreness", "Muscle soreness", "select", ["None", "Mild", "Moderate", "High"]),
        F("notes", "Recovery notes", "textarea")
      ],
      "Performance Goals": [
        F("title", "Goal"),
        F("category", "Area"),
        F("target", "Target"),
        F("date", "Review date", "date"),
        F("status", "Status", "select", ["Planned", "In progress", "Achieved"]),
        F("notes", "Plan", "textarea")
      ],
      "AI Coach": [
        F("topic", "Training question"),
        F("sport", "Sport / activity"),
        F("experience", "Current experience"),
        F("question", "Describe what you need help with", "textarea")
      ]
    },

    nutrition: {
      "Meal Journal": [
        F("meal", "Meal / food"),
        F("type", "Meal type", "select", ["Breakfast", "Lunch", "Dinner", "Snack"]),
        F("date", "Date", "date"),
        F("time", "Time", "time"),
        F("notes", "Portion / energy / notes", "textarea")
      ],
      Hydration: [
        F("date", "Date", "date"),
        F("amount", "Water consumed (ml)", "number"),
        F("time", "Time", "time"),
        F("notes", "Notes", "textarea")
      ],
      "Nutrition Guide": [
        F("title", "Topic"),
        F("category", "Category"),
        F("content", "What you learned", "textarea"),
        F("source", "Source")
      ],
      "Wellness Journal": [
        F("date", "Date", "date"),
        F("mood", "Mood", "select", ["Low", "Okay", "Good", "Great"]),
        F("energy", "Energy", "select", ["Low", "Moderate", "Good", "High"]),
        F("notes", "Reflection", "textarea")
      ],
      "Sleep Tracker": [
        F("date", "Date", "date"),
        F("bedtime", "Bedtime", "time"),
        F("wake", "Wake time", "time"),
        F("quality", "Sleep quality", "select", ["Poor", "Fair", "Good", "Excellent"]),
        F("notes", "Notes", "textarea")
      ],
      "AI Wellness Assistant": [
        F("topic", "Wellness topic"),
        F("question", "Your question", "textarea")
      ]
    },

    business: {
      Customers: [
        F("name", "Customer / organisation"),
        F("contact", "Contact person"),
        F("phone", "Phone"),
        F("email", "Email", "email"),
        F("location", "Location"),
        F("notes", "Customer notes", "textarea")
      ],
      Products: [
        F("name", "Product name"),
        F("category", "Category"),
        F("price", "Selling price (₹)", "number"),
        F("cost", "Cost price (₹)", "number"),
        F("stock", "Stock quantity", "number"),
        F("notes", "Product details", "textarea")
      ],
      Orders: [
        F("name", "Order / customer"),
        F("date", "Order date", "date"),
        F("amount", "Order value (₹)", "number"),
        F("status", "Order status", "select", ["New", "Processing", "Dispatched", "Delivered", "Cancelled"]),
        F("notes", "Order details", "textarea")
      ],
      "Finance Ledger": [
        F("title", "Transaction"),
        F("type", "Type", "select", ["Income", "Expense"]),
        F("amount", "Amount (₹)", "number"),
        F("date", "Date", "date"),
        F("category", "Category"),
        F("notes", "Description", "textarea")
      ],
      "Ideas Vault": [
        F("title", "Business idea"),
        F("category", "Industry"),
        F("potential", "Potential"),
        F("investment", "Estimated investment (₹)", "number"),
        F("notes", "Idea details", "textarea")
      ],
      "Business Academy": [
        F("title", "Business concept"),
        F("category", "Topic"),
        F("source", "Source"),
        F("notes", "What you learned", "textarea")
      ],
      "AI Business Strategist": [
        F("topic", "Business area"),
        F("goal", "Objective"),
        F("question", "Your business question", "textarea")
      ]
    },

    operations: {
      Tasks: [
        F("title", "Task"),
        F("category", "Category"),
        F("due", "Due date", "date"),
        F("priority", "Priority", "select", ["Low", "Normal", "High", "Urgent"]),
        F("status", "Status", "select", ["Not started", "In progress", "Completed"]),
        F("notes", "Details", "textarea")
      ],
      "Daily Planner": [
        F("title", "Activity"),
        F("date", "Date", "date"),
        F("start", "Start time", "time"),
        F("end", "End time", "time"),
        F("priority", "Priority", "select", ["Low", "Normal", "High"]),
        F("notes", "Details", "textarea")
      ],
      Routines: [
        F("title", "Routine"),
        F("frequency", "Frequency", "select", ["Daily", "Weekdays", "Weekly"]),
        F("time", "Preferred time", "time"),
        F("notes", "Routine steps", "textarea")
      ],
      Reminders: [
        F("title", "Reminder"),
        F("date", "Date", "date"),
        F("time", "Time", "time"),
        F("priority", "Priority", "select", ["Normal", "Important", "Urgent"]),
        F("notes", "Details", "textarea")
      ],
      Journal: [
        F("date", "Date", "date"),
        F("title", "Entry title"),
        F("mood", "Mood", "select", ["Low", "Okay", "Good", "Great"]),
        F("content", "Journal entry", "textarea")
      ],
      "Focus Mode": [
        F("title", "Focus session"),
        F("date", "Date", "date"),
        F("duration", "Duration (minutes)", "number"),
        F("goal", "What will you work on?", "textarea")
      ],
      "Time Management": [
        F("title", "Activity"),
        F("date", "Date", "date"),
        F("duration", "Time spent (minutes)", "number"),
        F("category", "Category"),
        F("notes", "Observations", "textarea")
      ]
    },

    personal: {
      "Personal Profile": [
        F("name", "Display name"),
        F("goal", "Main objective"),
        F("strengths", "Strengths", "textarea"),
        F("improvements", "Areas to improve", "textarea")
      ],
      "Daily Briefing": [
        F("date", "Date", "date"),
        F("objective", "Main objective"),
        F("priority", "Top priority"),
        F("notes", "Briefing notes", "textarea")
      ],
      "Goals & Vision": [
        F("title", "Goal"),
        F("category", "Area"),
        F("target", "Target"),
        F("date", "Target date", "date"),
        F("status", "Progress", "select", ["Planned", "In progress", "Achieved"]),
        F("notes", "Action plan", "textarea")
      ],
      "Habit Tracker": [
        F("title", "Habit"),
        F("frequency", "Frequency", "select", ["Daily", "Weekdays", "Weekly"]),
        F("date", "Start date", "date"),
        F("notes", "Habit details", "textarea")
      ],
      "Rules & Standards": [
        F("title", "Personal standard"),
        F("category", "Category"),
        F("reason", "Why it matters", "textarea")
      ],
      "Decision Journal": [
        F("title", "Decision"),
        F("date", "Date", "date"),
        F("options", "Options considered", "textarea"),
        F("decision", "Final decision", "textarea"),
        F("reason", "Reasoning", "textarea")
      ],
      "Personal Review": [
        F("date", "Review date", "date"),
        F("wins", "What went well", "textarea"),
        F("challenges", "Challenges", "textarea"),
        F("next", "Next steps", "textarea")
      ]
    },

    skills: {
      "Skill Library": [
        F("name", "Skill"),
        F("category", "Category"),
        F("level", "Current level", "select", ["New", "Learning", "Developing", "Confident"]),
        F("notes", "Notes", "textarea")
      ],
      "Learning Roadmap": [
        F("title", "Learning milestone"),
        F("skill", "Skill"),
        F("date", "Target date", "date"),
        F("status", "Status", "select", ["Planned", "In progress", "Completed"]),
        F("notes", "Steps", "textarea")
      ],
      "Practice Tracker": [
        F("title", "Practice session"),
        F("date", "Date", "date"),
        F("duration", "Duration (minutes)", "number"),
        F("result", "What improved?", "textarea")
      ],
      "Projects & Portfolio": [
        F("title", "Project"),
        F("category", "Category"),
        F("date", "Deadline", "date"),
        F("status", "Status", "select", ["Idea", "In progress", "Completed"]),
        F("link", "Project link", "url"),
        F("notes", "Description", "textarea")
      ],
      "Resource Vault": [
        F("title", "Resource"),
        F("category", "Category"),
        F("link", "URL", "url"),
        F("notes", "Why it's useful", "textarea")
      ],
      "Progress Analytics": [
        F("title", "Progress checkpoint"),
        F("date", "Date", "date"),
        F("result", "What did you achieve?", "textarea"),
        F("next", "Next milestone", "textarea")
      ],
      "AI Skill Coach": [
        F("skill", "Skill"),
        F("goal", "Learning goal"),
        F("question", "What do you need help with?", "textarea")
      ]
    },

    finance: {
      "Income Tracker": [
        F("title", "Income source"),
        F("amount", "Amount (₹)", "number"),
        F("date", "Date", "date"),
        F("category", "Category"),
        F("notes", "Details", "textarea")
      ],
      "Expense Tracker": [
        F("title", "Expense"),
        F("amount", "Amount (₹)", "number"),
        F("date", "Date", "date"),
        F("category", "Category"),
        F("notes", "Details", "textarea")
      ],
      "Savings Vault": [
        F("title", "Savings goal"),
        F("target", "Target amount (₹)", "number"),
        F("saved", "Amount saved (₹)", "number"),
        F("date", "Target date", "date"),
        F("notes", "Notes", "textarea")
      ],
      "Asset Register": [
        F("name", "Asset"),
        F("category", "Asset type"),
        F("value", "Estimated value (₹)", "number"),
        F("date", "Date acquired", "date"),
        F("notes", "Details", "textarea")
      ],
      "Financial Goals": [
        F("title", "Financial goal"),
        F("target", "Target amount (₹)", "number"),
        F("saved", "Current amount (₹)", "number"),
        F("date", "Target date", "date"),
        F("notes", "Plan", "textarea")
      ],
      "Financial Knowledge": [
        F("title", "Topic"),
        F("category", "Category"),
        F("source", "Source"),
        F("notes", "What you learned", "textarea")
      ],
      "AI Finance Advisor": [
        F("topic", "Financial topic"),
        F("goal", "Learning objective"),
        F("question", "Your question", "textarea")
      ]
    },

    knowledge: {
      "Quick Notes": [
        F("title", "Note title"),
        F("category", "Category"),
        F("content", "Note", "textarea")
      ],
      "Research Library": [
        F("title", "Research topic"),
        F("category", "Subject"),
        F("source", "Source / URL"),
        F("findings", "Research findings", "textarea")
      ],
      "Book Library": [
        F("title", "Book"),
        F("author", "Author"),
        F("status", "Reading status", "select", ["Want to read", "Reading", "Finished"]),
        F("rating", "Your rating (out of 5)", "number"),
        F("notes", "Book notes", "textarea")
      ],
      "Learning Archive": [
        F("title", "Learning entry"),
        F("category", "Topic"),
        F("date", "Date", "date"),
        F("content", "What you learned", "textarea")
      ],
      "Reference Vault": [
        F("title", "Reference"),
        F("category", "Category"),
        F("link", "URL", "url"),
        F("notes", "Description", "textarea")
      ],
      "Knowledge Search": [
        F("title", "Knowledge entry"),
        F("category", "Category"),
        F("content", "Information", "textarea"),
        F("source", "Source")
      ]
    },

    missions: {
      "Mission Log": [
        F("title", "Mission"),
        F("priority", "Priority", "select", ["Low", "Normal", "High", "Critical"]),
        F("date", "Deadline", "date"),
        F("status", "Status", "select", ["Active", "In progress", "Completed"]),
        F("objective", "Objective", "textarea"),
        F("notes", "Mission notes", "textarea")
      ],
      Objectives: [
        F("title", "Objective"),
        F("category", "Area"),
        F("date", "Target date", "date"),
        F("status", "Status", "select", ["Planned", "In progress", "Completed"]),
        F("notes", "Action steps", "textarea")
      ],
      Milestones: [
        F("title", "Milestone"),
        F("mission", "Related mission"),
        F("date", "Target date", "date"),
        F("status", "Status", "select", ["Upcoming", "In progress", "Completed"]),
        F("notes", "Details", "textarea")
      ],
      "After-Action Review": [
        F("title", "Review title"),
        F("date", "Review date", "date"),
        F("wins", "What worked?", "textarea"),
        F("problems", "What needs improvement?", "textarea"),
        F("next", "Next action", "textarea")
      ]
    },

    lifestyle: {
      "Wardrobe Collection": [
        F("name", "Clothing item"),
        F("category", "Category", "select", ["T-shirt", "Shirt", "Trousers", "Jeans", "Jacket", "Hoodie", "Shoes", "Other"]),
        F("color", "Colour"),
        F("brand", "Brand"),
        F("notes", "Details", "textarea")
      ],
      "Outfit Builder": [
        F("title", "Outfit name"),
        F("top", "Top"),
        F("bottom", "Bottom"),
        F("shoes", "Footwear"),
        F("occasion", "Occasion"),
        F("notes", "Styling notes", "textarea")
      ],
      "Style Journal": [
        F("title", "Style idea"),
        F("category", "Style"),
        F("date", "Date", "date"),
        F("notes", "Details", "textarea")
      ],
      "Accessories Vault": [
        F("name", "Accessory"),
        F("category", "Type"),
        F("color", "Colour"),
        F("notes", "Details", "textarea")
      ],
      "Fragrance Collection": [
        F("name", "Fragrance"),
        F("brand", "Brand"),
        F("type", "Fragrance type"),
        F("notes", "Personal notes", "textarea")
      ],
      "Shopping Wishlist": [
        F("name", "Item"),
        F("category", "Category"),
        F("price", "Expected price (₹)", "number"),
        F("priority", "Priority", "select", ["Low", "Normal", "High"]),
        F("link", "Product link", "url"),
        F("notes", "Details", "textarea")
      ],
      "AI Style Advisor": [
        F("occasion", "Occasion"),
        F("style", "Preferred style"),
        F("budget", "Budget (₹)", "number"),
        F("question", "What do you need help with?", "textarea")
      ]
    }
  };

  /* ---------------------------------------------------------
     03 — FORM ENGINE
  --------------------------------------------------------- */

  function schemaFor(dept, tool) {
    return fields[dept]?.[tool] || [
      F("title", "Name / title"),
      F("category", "Category"),
      F("date", "Date", "date"),
      F("notes", "Details", "textarea")
    ];
  }

  function renderField(field, index) {
    const id = `field-${index}`;
    const required = index === 0 ? "required" : "";

    if (field.type === "textarea") {
      return `
        <label class="af-field" for="${id}">
          <span>${esc(field.label)}</span>
          <textarea id="${id}" name="${esc(field.name)}"
            rows="3" placeholder="Enter ${esc(field.label.toLowerCase())}..."
            ${required}></textarea>
        </label>`;
    }

    if (field.type === "select") {
      return `
        <label class="af-field" for="${id}">
          <span>${esc(field.label)}</span>
          <select id="${id}" name="${esc(field.name)}" ${required}>
            <option value="">Select...</option>
            ${(field.options || []).map(option =>
              `<option value="${esc(option)}">${esc(option)}</option>`
            ).join("")}
          </select>
        </label>`;
    }

    return `
      <label class="af-field" for="${id}">
        <span>${esc(field.label)}</span>
        <input id="${id}" name="${esc(field.name)}"
          type="${esc(field.type)}"
          ${field.type === "number" ? 'min="0" step="any"' : ""}
          placeholder="${field.type === "date" || field.type === "time" ? "" : "Enter " + esc(field.label.toLowerCase()) + "..."}"
          ${required}>
      </label>`;
  }

  function openDepartment(id) {
    const dept = departments[id];
    if (!dept) return;

    activeDepartment = id;
    activeTool = null;

    $("#department-title").textContent = dept.name;
    $("#department-description").textContent = dept.description;

    $("#department-content").innerHTML = `
      <div class="af-section-heading">SPECIALIST TOOLS</div>
      <div class="af-tool-grid">
        ${dept.tools.map((tool, index) => `
          <button class="af-tool-card" data-tool-index="${index}">
            <span class="af-tool-index">${String(index + 1).padStart(2, "0")}</span>
            <span class="af-tool-name">
              <b>${esc(tool)}</b>
              <small>OPEN WORKSPACE</small>
            </span>
            <span class="af-arrow">↗</span>
          </button>
        `).join("")}
      </div>
      <div class="af-footnote">ALFRED 2.0 / ${esc(dept.name.toUpperCase())}</div>
    `;

    showPage("department");
  }

  function openTool(dept, index) {
    const tool = departments[dept]?.tools[index];
    if (!tool) return;

    activeDepartment = dept;
    activeTool = tool;
    searchTerm = "";
    activeFilter = "all";

    $("#tool-title").textContent = tool;

    renderTool();
    showPage("tool");
  }

  function renderTool() {
    const container = $("#tool-content");
    if (!container || !activeDepartment || !activeTool) return;

    const schema = schemaFor(activeDepartment, activeTool);
    const items = records();

    const isAI = activeTool.startsWith("AI ");
    const isTimer = activeTool === "Focus Mode";
    const isFlashcards = activeTool === "Flashcards";

    container.innerHTML = `
      <button class="af-back" data-action="back-department">
        ← ${esc(departments[activeDepartment].name.toUpperCase())}
      </button>

      <div class="af-tool-intro">
        <div class="af-eyebrow">${esc(activeDepartment.toUpperCase())} / WORKSPACE</div>
        <h3>${esc(activeTool)}</h3>
        <p>${isAI
          ? "Prepare a request for this specialist assistant."
          : "Create, organise and manage your records."
        }</p>
      </div>

      ${isAI ? renderAIRequest(schema) : ""}

      ${isTimer ? `
        <section class="af-panel">
          <div class="af-panel-title">FOCUS SESSION</div>
          <div class="af-timer" id="af-timer">25:00</div>
          <div class="af-timer-controls">
            <button id="af-timer-start">START</button>
            <button id="af-timer-reset">RESET</button>
          </div>
          <div class="af-muted" id="af-timer-status">READY WHEN YOU ARE</div>
        </section>
      ` : ""}

      ${isFlashcards ? renderFlashcard(items) : ""}

      <section class="af-panel">
        <div class="af-panel-title">
          ${isAI ? "SAVE YOUR REQUEST" : "CREATE NEW RECORD"}
        </div>

        <form id="af-record-form">
          <div class="af-form-grid">
            ${schema.map(renderField).join("")}
          </div>
          <button class="af-primary" type="submit">
            SAVE ${isAI ? "REQUEST" : "RECORD"} ↗
          </button>
        </form>
      </section>

      <section class="af-record-section">
        <div class="af-record-header">
          <div>
            <div class="af-panel-title">YOUR RECORDS</div>
            <small id="af-record-count">${items.length} SAVED</small>
          </div>
          <button id="af-export" class="af-outline">EXPORT</button>
        </div>

        <input id="af-search" class="af-search"
          placeholder="Search your records..." value="${esc(searchTerm)}">

        <div class="af-filters">
          <button data-filter="all" class="af-filter active">ALL</button>
          <button data-filter="active" class="af-filter">ACTIVE</button>
          <button data-filter="completed" class="af-filter">COMPLETED</button>
        </div>

        <div id="af-record-list"></div>
      </section>
    `;

    $("#af-record-form").addEventListener("submit", saveRecord);

    $("#af-search").addEventListener("input", event => {
      searchTerm = event.target.value;
      renderRecords();
    });

    $("#af-export").addEventListener("click", exportRecords);

    $$(".af-filter").forEach(button => {
      button.classList.toggle("active", button.dataset.filter === activeFilter);
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        $$(".af-filter").forEach(b =>
          b.classList.toggle("active", b === button)
        );
        renderRecords();
      });
    });

    renderRecords();

    if (isTimer) setupFocusTimer();
  }

  function renderAIRequest(schema) {
    return `
      <section class="af-ai-panel">
        <div class="af-ai-label">SPECIALIST ASSISTANT</div>
        <p>This workspace prepares your request for the ${esc(activeTool)} assistant.</p>
        <div class="af-ai-note">
          Live AI requires a secure backend connection. Your request can be saved here in the meantime.
        </div>
      </section>
    `;
  }

  function renderFlashcard(items) {
    const cards = items.filter(item => item.data?.question);
    if (!cards.length) return "";

    return `
      <section class="af-panel">
        <div class="af-panel-title">FLASHCARD REVIEW</div>
        <div id="af-flashcard" class="af-flashcard">
          <b>${esc(cards[0].data.question)}</b>
          <div class="af-muted">QUESTION 1 / ${cards.length}</div>
          <button id="af-reveal-answer" class="af-outline">REVEAL ANSWER</button>
          <p id="af-flash-answer" hidden>${esc(cards[0].data.answer)}</p>
        </div>
      </section>
    `;
  }

  function saveRecord(event) {
    event.preventDefault();

    const schema = schemaFor(activeDepartment, activeTool);
    const data = {};

    schema.forEach(field => {
      const input = $(`[name="${field.name}"]`, event.currentTarget);
      data[field.name] = input?.value.trim() || "";
    });

    if (!Object.values(data).some(Boolean)) return;

    const items = records();

    items.unshift({
      id: Date.now() + Math.random(),
      data,
      created: new Date().toISOString(),
      done: data.status === "Completed"
    });

    setRecords(items);
    renderTool();
    updateDashboard();
  }

  function recordTitle(item) {
    const data = item.data || {};
    return data.title || data.name || data.meal ||
      data.skill || data.topic || data.objective ||
      data.question || item.text || "Untitled record";
  }

  function renderRecords() {
    const list = $("#af-record-list");
    if (!list) return;

    const items = records();
    const filtered = items.filter(item => {
      const data = item.data || {};
      const text = JSON.stringify(data).toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());

      const status = String(data.status || "").toLowerCase();
      const done = item.done || status === "completed" || status === "achieved";

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "completed" && done) ||
        (activeFilter === "active" && !done);

      return matchesSearch && matchesFilter;
    });

    const count = $("#af-record-count");
    if (count) count.textContent = `${filtered.length} SHOWN / ${items.length} TOTAL`;

    if (!filtered.length) {
      list.innerHTML = `<div class="af-empty">NO MATCHING RECORDS.</div>`;
      return;
    }

    list.innerHTML = filtered.map(item => {
      const data = item.data || {};
      const title = recordTitle(item);
      const completed = item.done ||
        String(data.status || "").toLowerCase() === "completed" ||
        String(data.status || "").toLowerCase() === "achieved";

      const details = Object.entries(data)
        .filter(([key, value]) =>
          value && !["title", "name", "meal", "skill", "topic", "objective"].includes(key)
        )
        .slice(0, 4)
        .map(([key, value]) => `
          <span class="af-detail">
            <b>${esc(key)}:</b> ${esc(value)}
          </span>
        `).join("");

      return `
        <article class="af-record ${completed ? "is-complete" : ""}">
          <div class="af-record-top">
            <div>
              <b>${esc(title)}</b>
              <div class="af-record-details">${details}</div>
            </div>
            <span class="af-record-status">${completed ? "COMPLETED" : "ACTIVE"}</span>
          </div>

          <div class="af-record-bottom">
            <small>${new Date(item.created || Date.now()).toLocaleDateString()}</small>
            <div>
              <button data-record-action="toggle" data-id="${item.id}">
                ${completed ? "REOPEN" : "COMPLETE"}
              </button>
              <button data-record-action="edit" data-id="${item.id}">EDIT</button>
              <button data-record-action="delete" data-id="${item.id}">DELETE</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  /* ---------------------------------------------------------
     04 — RECORD ACTIONS
  --------------------------------------------------------- */

  $("#tool-content").addEventListener("click", event => {
    const button = event.target.closest("[data-record-action]");
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.recordAction;
    const items = records();
    const index = items.findIndex(item => String(item.id) === String(id));

    if (index < 0) return;

    if (action === "delete") {
      if (!confirm("Delete this record?")) return;
      items.splice(index, 1);
    }

    if (action === "toggle") {
      items[index].done = !items[index].done;
      if (items[index].data) {
        items[index].data.status = items[index].done ? "Completed" : "In progress";
      }
    }

    if (action === "edit") {
      const oldTitle = recordTitle(items[index]);
      const updated = prompt("Edit record title:", oldTitle);
      if (updated === null || !updated.trim()) return;

      const data = items[index].data || {};
      const titleKey = ["title", "name", "meal", "skill", "topic", "objective", "question"]
        .find(key => key in data) || "title";

      data[titleKey] = updated.trim();
      items[index].data = data;
    }

    setRecords(items);
    renderRecords();
    updateDashboard();
  });

  /* ---------------------------------------------------------
     05 — EXPORT
  --------------------------------------------------------- */

  function exportRecords() {
    const items = records();
    const blob = new Blob(
      [JSON.stringify(items, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      `${activeDepartment}-${activeTool.replace(/\s+/g, "-")}.json`;

    link.click();
    URL.revokeObjectURL(url);
  }

  /* ---------------------------------------------------------
     06 — FOCUS TIMER
  --------------------------------------------------------- */

  let timerSeconds = 25 * 60;
  let timerInterval = null;

  function setupFocusTimer() {
    const display = $("#af-timer");
    const start = $("#af-timer-start");
    const reset = $("#af-timer-reset");
    const status = $("#af-timer-status");

    if (!display || !start || !reset) return;

    const update = () => {
      display.textContent =
        String(Math.floor(timerSeconds / 60)).padStart(2, "0") +
        ":" +
        String(timerSeconds % 60).padStart(2, "0");
    };

    start.addEventListener("click", () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        start.textContent = "RESUME";
        status.textContent = "PAUSED";
        return;
      }

      start.textContent = "PAUSE";
      status.textContent = "FOCUS SESSION ACTIVE";

      timerInterval = setInterval(() => {
        timerSeconds--;
        update();

        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          start.textContent = "START";
          status.textContent = "SESSION COMPLETE";
          alert("Focus session complete. Take a short break.");
        }
      }, 1000);
    });

    reset.addEventListener("click", () => {
      clearInterval(timerInterval);
      timerInterval = null;
      timerSeconds = 25 * 60;
      start.textContent = "START";
      status.textContent = "READY WHEN YOU ARE";
      update();
    });

    update();
  }

  /* ---------------------------------------------------------
     07 — FLASHCARDS
  --------------------------------------------------------- */

  $("#tool-content").addEventListener("click", event => {
    if (event.target.id === "af-reveal-answer") {
      const answer = $("#af-flash-answer");
      if (!answer) return;

      answer.hidden = !answer.hidden;
      event.target.textContent = answer.hidden
        ? "REVEAL ANSWER"
        : "HIDE ANSWER";
    }
  });

  /* ---------------------------------------------------------
     08 — NAVIGATION
  --------------------------------------------------------- */

  function showPage(id) {
    $$(".page").forEach(page => page.classList.remove("active"));

    const page = $("#page-" + id);
    if (page) page.classList.add("active");

    $$(".nav-item[data-page]").forEach(button => {
      button.classList.toggle("active", button.dataset.page === id);
    });

    const boot = $("#alfred-boot-status");
    if (boot) boot.style.display = id === "home" ? "" : "none";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    activeDepartment = null;
    activeTool = null;
    showPage("home");
    updateDashboard();
  }

  document.addEventListener("click", event => {
    const homeDept = event.target.closest("[data-home-department]");
    if (homeDept) {
      openDepartment(homeDept.dataset.homeDepartment);
      return;
    }

    const nav = event.target.closest(".nav-item[data-page]");
    if (nav) {
      if (nav.dataset.page === "home") goHome();
      else openDepartment(nav.dataset.page);
      return;
    }

    const toolCard = event.target.closest("[data-tool-index]");
    if (toolCard && activeDepartment) {
      openTool(activeDepartment, Number(toolCard.dataset.toolIndex));
      return;
    }

    const quick = event.target.closest("[data-tool]");
    if (quick) {
      quickAction(quick.dataset.tool);
      return;
    }

    const open = event.target.closest("[data-open]");
    if (open) {
      quickAction(open.dataset.open);
      return;
    }

    const back = event.target.closest("[data-action='back-department']");
    if (back && activeDepartment) openDepartment(activeDepartment);
  });

  function quickAction(action) {
    const routes = {
      focus: ["operations", 5],
      planner: ["operations", 1],
      notes: ["knowledge", 0],
      missions: ["missions", 0],
      goals: ["personal", 2],
      tasks: ["operations", 0]
    };

    if (action === "settings") {
      editProfile();
      return;
    }

    if (action === "ai") {
      openAI();
      return;
    }

    const route = routes[action];
    if (!route) return;

    openDepartment(route[0]);
    openTool(route[0], route[1]);
  }

  /* ---------------------------------------------------------
     09 — PROFILE + HOMEPAGE BOOT PANEL
  --------------------------------------------------------- */

  function saveProfile() {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      updateProfile();
    } catch {
      alert("Image too large. Please choose a smaller image.");
    }
  }

  function updateProfile() {
    const name = $("#af-profile-name");
    const avatar = $("#af-profile-avatar");

    if (name) name.textContent = profile.username || "Bruce";

    if (avatar) {
      avatar.innerHTML = "";

      if (profile.photo) {
        const img = document.createElement("img");
        img.src = profile.photo;
        img.alt = "Profile";
        avatar.appendChild(img);
      } else {
        avatar.textContent = (profile.username || "B")[0].toUpperCase();
      }
    }
  }

  function editProfile() {
    const name = prompt("Display name:", profile.username || "Bruce");
    if (name && name.trim()) {
      profile.username = name.trim().slice(0, 30);
      saveProfile();
    }
  }

  function createBootPanel() {
    if ($("#alfred-boot-status")) return;

    const topbar = $(".topbar");
    if (!topbar) return;

    const panel = document.createElement("section");
    panel.id = "alfred-boot-status";

    panel.innerHTML = `
      <div class="af-profile-strip">
        <button id="af-profile-avatar" title="Change profile picture"></button>
        <div class="af-profile-text">
          <b id="af-profile-name">Bruce</b>
          <small>PERSONAL COMMAND SYSTEM</small>
        </div>
        <button id="af-profile-edit">EDIT PROFILE</button>
        <span class="af-online">● ONLINE</span>
      </div>
      <div class="af-boot-center">
        <small>PERSONAL COMMAND SYSTEM</small>
        <h2>ALFRED</h2>
        <div id="af-boot-message">ALFRED LOADING...</div>
        <div class="af-boot-line"><span></span></div>
        <small>DISCIPLINE · STRATEGY · EXECUTION</small>
      </div>
      <input id="af-profile-file" type="file" accept="image/*" hidden>
    `;

    topbar.insertAdjacentElement("afterend", panel);

    $("#af-profile-edit").addEventListener("click", editProfile);
    $("#af-profile-avatar").addEventListener("click", () =>
      $("#af-profile-file").click()
    );

    $("#af-profile-file").addEventListener("change", event => {
      const file = event.target.files[0];
      if (!file || !file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = Math.min(1, 240 / Math.max(image.width, image.height));

          canvas.width = image.width * scale;
          canvas.height = image.height * scale;
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

          profile.photo = canvas.toDataURL("image/jpeg", 0.72);
          saveProfile();
        };

        image.src = reader.result;
      };

      reader.readAsDataURL(file);
    });

    updateProfile();

    requestAnimationFrame(() => panel.classList.add("af-boot-start"));

    setTimeout(() => {
      const message = $("#af-boot-message");
      if (message) message.textContent = "SYSTEM ONLINE";
    }, 1500);
  }

  /* ---------------------------------------------------------
     10 — CENTRAL ALFRED
  --------------------------------------------------------- */

  const aiModes = [
    "General Assistant", "Academic Advisor", "Fitness Coach",
    "Nutrition Guide", "Business Strategist", "Daily Planner",
    "Personal Advisor", "Finance Educator", "Research Assistant",
    "Lifestyle Advisor", "Skill Development Coach", "Mission Strategist"
  ];

  function createAI() {
    if ($("#alfred-ai-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "alfred-ai-overlay";

    overlay.innerHTML = `
      <div class="af-ai-window">
        <header class="af-ai-header">
          <div>
            <b>ALFRED</b>
            <small>PERSONAL INTELLIGENCE SYSTEM</small>
          </div>
          <button id="af-ai-close">×</button>
        </header>

        <label class="af-ai-label" for="af-ai-mode">ACTIVE SPECIALIST</label>
        <select id="af-ai-mode">
          ${aiModes.map(mode => `<option>${esc(mode)}</option>`).join("")}
        </select>

        <div id="af-ai-messages">
          <div class="af-ai-message">
            Good day, Commander. Select a specialist and enter your request.
          </div>
        </div>

        <form id="af-ai-form">
          <input id="af-ai-input" placeholder="Enter your command..." autocomplete="off">
          <button>SEND ↗</button>
        </form>

        <small class="af-ai-disclaimer">
          LIVE AI REQUIRES A SECURE BACKEND CONNECTION
        </small>
      </div>
    `;

    document.body.appendChild(overlay);

    $("#af-ai-mode").value = aiModes.includes(aiMode) ? aiMode : aiModes[0];

    $("#af-ai-mode").addEventListener("change", event => {
      aiMode = event.target.value;
      localStorage.setItem(AI_KEY, aiMode);
    });

    $("#af-ai-close").addEventListener("click", closeAI);

    $("#af-ai-form").addEventListener("submit", event => {
      event.preventDefault();

      const input = $("#af-ai-input");
      const value = input.value.trim();
      if (!value) return;

      addAIMessage(value, true);
      input.value = "";

      addAIMessage(
        "Your request has been recorded in this interface. Live specialist responses will become available once a secure AI service is connected.",
        false
      );
    });
  }

  function addAIMessage(message, user) {
    const container = $("#af-ai-messages");
    const bubble = document.createElement("div");

    bubble.className = "af-ai-message" + (user ? " user" : "");
    bubble.textContent = message;

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  function openAI() {
    createAI();
    $("#alfred-ai-overlay").classList.add("visible");
    $("#af-ai-input").focus();
  }

  function closeAI() {
    $("#alfred-ai-overlay")?.classList.remove("visible");
  }

  $("#alfred-ai-launcher")?.addEventListener("click", openAI);

  /* ---------------------------------------------------------
     11 — DASHBOARD
  --------------------------------------------------------- */

  function updateDashboard() {
    const tasks = db[keyFor("operations", "Tasks")] || [];
    const missions = db[keyFor("missions", "Mission Log")] || [];

    const completed = missions.filter(item =>
      item.done || item.data?.status === "Completed"
    ).length;

    const put = (selector, value) => {
      const element = $(selector);
      if (element) element.textContent = value;
    };

    put("#active-count", Math.max(0, missions.length - completed));
    put("#completion-rate", missions.length
      ? Math.round(completed / missions.length * 100) + "%"
      : "0%");
    put("#task-count", tasks.length);
    put("#focus-status", "READY");

    const taskArea = $("#dashboard-tasks");
    if (taskArea) {
      taskArea.innerHTML = tasks.length
        ? tasks.slice(0, 4).map(item =>
            `<div class="af-dashboard-task">${esc(recordTitle(item))}</div>`
          ).join("")
        : `<div class="af-empty">No tasks recorded yet.</div>`;
    }

    put("#briefing-date", new Date().toLocaleDateString());
    put("#briefing-tasks", `${tasks.length} Tasks`);
    put("#briefing-missions", `${missions.length} Missions`);
  }

  function updateClock() {
    const now = new Date();

    const date = $("#current-date");
    const time = $("#current-time");
    const greeting = $("#greeting");

    if (date) date.textContent = now.toLocaleDateString();
    if (time) time.textContent = now.toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit"
    });

    if (greeting) {
      const hour = now.getHours();
      greeting.textContent =
        (hour < 12 ? "Good morning" :
         hour < 17 ? "Good afternoon" : "Good evening") +
        ", Commander.";
    }
  }

  /* ---------------------------------------------------------
     12 — ORIGINAL COLOUR SYSTEM / TOOL STYLING
  --------------------------------------------------------- */

  const css = document.createElement("style");
  css.id = "alfred-specialist-styles";

  css.textContent = `
    #alfred-boot-status {
      margin: 14px 0;
      padding: 17px;
      background: var(--surface,#101010);
      border: 1px solid var(--border,rgba(210,215,222,.17));
      color: var(--silver,#d9dce0);
    }

    .af-profile-strip {
      display:flex; align-items:center; gap:11px;
      padding-bottom:13px;
      border-bottom:1px solid var(--border);
    }

    #af-profile-avatar {
      width:42px;height:42px;border-radius:50%;
      overflow:hidden;display:grid;place-items:center;
      background:var(--surface-3);color:var(--silver);
      border:1px solid var(--border);
    }

    #af-profile-avatar img {width:100%;height:100%;object-fit:cover}
    .af-profile-text {flex:1;min-width:0}
    .af-profile-text b,.af-profile-text small {display:block}
    .af-profile-text b {font-size:12px}
    .af-profile-text small,.af-online {font-size:8px;color:var(--muted);letter-spacing:1px;margin-top:5px}
    #af-profile-edit {background:none;border:1px solid var(--border);color:var(--silver-dim);padding:7px;font-size:8px}
    .af-online {color:var(--blue)}
    .af-boot-center {text-align:center;padding:20px 5px 8px}
    .af-boot-center small {color:var(--muted);font-size:8px;letter-spacing:1.5px}
    .af-boot-center h2 {font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;letter-spacing:7px;margin:12px 0}
    #af-boot-message {font-size:9px;letter-spacing:2px;margin:12px}
    .af-boot-line {height:3px;width:180px;max-width:80%;background:var(--surface-3);margin:16px auto;overflow:hidden}
    .af-boot-line span {display:block;width:0;height:100%;background:var(--blue);transition:width 1.4s ease}
    .af-boot-start .af-boot-line span {width:100%}

    .af-section-heading,.af-panel-title {font-size:9px;letter-spacing:1.6px;color:var(--silver-dim);margin-bottom:13px}
    .af-tool-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .af-tool-card {display:flex;align-items:center;gap:12px;text-align:left;padding:15px;background:var(--surface);border:1px solid var(--border);color:var(--silver);min-width:0}
    .af-tool-index {font-size:10px;color:var(--blue)}
    .af-tool-name {flex:1;min-width:0}
    .af-tool-name b {display:block;font-size:11px;font-weight:500}
    .af-tool-name small {display:block;margin-top:6px;font-size:8px;color:var(--muted)}
    .af-arrow {color:var(--muted)}
    .af-footnote {margin-top:24px;padding:14px 0;border-top:1px solid var(--border);font-size:8px;letter-spacing:1.4px;color:var(--muted)}

    .af-back,.af-outline {background:transparent;border:1px solid var(--border);color:var(--silver-dim);padding:9px 12px;font-size:9px}
    .af-tool-intro {margin:19px 0}
    .af-tool-intro h3 {font-size:20px;font-weight:500;margin:8px 0}
    .af-tool-intro p,.af-ai-panel p {font-size:11px;color:var(--muted);line-height:1.6}
    .af-eyebrow,.af-ai-label {font-size:8px;letter-spacing:1.6px;color:var(--blue)}
    .af-panel,.af-ai-panel {padding:16px;margin:13px 0;background:var(--surface);border:1px solid var(--border)}
    .af-form-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .af-field {display:flex;flex-direction:column;gap:7px;min-width:0}
    .af-field span {font-size:9px;color:var(--silver-dim)}
    .af-field input,.af-field select,.af-field textarea,.af-search {
      width:100%;min-width:0;padding:11px;
      background:var(--bg,#070707);border:1px solid var(--border);
      color:var(--white,#f3f4f5);font:inherit;font-size:11px;
      border-radius:0;outline:none;
    }
    .af-field textarea {resize:vertical}
    .af-primary {margin-top:15px;padding:11px 17px;background:var(--silver);color:#090909;border:0;font-size:9px;letter-spacing:1px}
    .af-record-section {margin-top:25px}
    .af-record-header {display:flex;align-items:center;justify-content:space-between}
    .af-record-header small {font-size:8px;color:var(--muted)}
    .af-search {margin:12px 0}
    .af-filters {display:flex;gap:7px;margin-bottom:12px}
    .af-filter {background:transparent;border:1px solid var(--border);color:var(--muted);padding:7px 10px;font-size:8px}
    .af-filter.active {border-color:var(--blue);color:var(--blue)}
    .af-record {padding:13px;margin:9px 0;background:var(--surface);border:1px solid var(--border);overflow-wrap:anywhere}
    .af-record.is-complete {opacity:.65}
    .af-record-top {display:flex;justify-content:space-between;gap:12px}
    .af-record-top b {font-size:11px;font-weight:500}
    .af-record-status {font-size:7px;letter-spacing:1px;color:var(--blue);white-space:nowrap}
    .af-record-details {display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
    .af-detail {font-size:9px;color:var(--muted)}
    .af-record-bottom {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:13px}
    .af-record-bottom small {font-size:8px;color:var(--muted)}
    .af-record-bottom button {background:none;border:0;color:var(--silver-dim);font-size:8px;margin-left:7px;padding:4px}
    .af-record-bottom button:last-child {color:#c58c8c}
    .af-empty {padding:22px 5px;color:var(--muted);font-size:9px;letter-spacing:1px}
    .af-ai-note {padding:10px;margin-top:12px;border:1px solid var(--border);font-size:9px;color:var(--muted);line-height:1.6}
    .af-timer {font-size:45px;text-align:center;letter-spacing:3px;padding:16px;font-variant-numeric:tabular-nums}
    .af-timer-controls {display:flex;justify-content:center;gap:10px}
    .af-timer-controls button {padding:9px 16px;background:var(--surface-3);border:1px solid var(--border);color:var(--silver);font-size:9px}
    .af-muted {text-align:center;margin-top:13px;font-size:8px;color:var(--muted);letter-spacing:1px}
    .af-flashcard {padding:15px;background:var(--bg);border:1px solid var(--border)}
    .af-flashcard b {display:block;margin-bottom:14px;font-size:13px}
    .af-flashcard p {font-size:12px;line-height:1.6;color:var(--silver)}
    .af-flashcard button {margin-top:12px}

    #alfred-ai-overlay {display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.82);align-items:center;justify-content:center;padding:14px}
    #alfred-ai-overlay.visible {display:flex}
    .af-ai-window {width:min(540px,100%);height:min(680px,85vh);display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--border)}
    .af-ai-header {display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid var(--border)}
    .af-ai-header b {font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;letter-spacing:4px}
    .af-ai-header small {display:block;color:var(--muted);font-size:8px;margin-top:5px}
    #af-ai-close {background:none;border:0;color:var(--silver);font-size:24px}
    .af-ai-label {margin:15px 16px 6px}
    #af-ai-mode {margin:0 16px;padding:11px;background:var(--surface);border:1px solid var(--border);color:var(--silver)}
    #af-ai-messages {flex:1;overflow-y:auto;padding:16px}
    .af-ai-message {max-width:90%;padding:12px;margin-bottom:10px;background:var(--surface-2);border:1px solid var(--border);color:var(--silver);font-size:11px;line-height:1.6;overflow-wrap:anywhere}
    .af-ai-message.user {margin-left:auto;background:var(--surface-3)}
    #af-ai-form {display:flex;gap:8px;padding:12px;border-top:1px solid var(--border)}
    #af-ai-input {flex:1;min-width:0;padding:11px;background:var(--surface);border:1px solid var(--border);color:var(--white)}
    #af-ai-form button {padding:0 14px;background:var(--silver);border:0;color:#080808;font-size:9px}
    .af-ai-disclaimer {padding:9px;text-align:center;color:var(--muted);font-size:7px;letter-spacing:1px}

    @media(max-width:600px) {
      .af-tool-grid {grid-template-columns:1fr}
      .af-form-grid {grid-template-columns:1fr}
      .af-record-top {flex-direction:column}
      .af-record-bottom {align-items:flex-start;flex-direction:column}
      .af-online {display:none}
    }
  `;

  document.head.appendChild(css);

  /* ---------------------------------------------------------
     13 — CLOCK
  --------------------------------------------------------- */

  function updateClock() {
    const now = new Date();

    const date = $("#current-date");
    const time = $("#current-time");
    const greeting = $("#greeting");

    if (date) date.textContent = now.toLocaleDateString();
    if (time) time.textContent = now.toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit"
    });

    if (greeting) {
      const hour = now.getHours();
      greeting.textContent =
        (hour < 12 ? "Good morning" :
         hour < 17 ? "Good afternoon" : "Good evening") +
        ", Commander.";
    }
  }

  /* ---------------------------------------------------------
     14 — HOMEPAGE DASHBOARD
  --------------------------------------------------------- */

  function updateDashboard() {
    const tasks = db[keyFor("operations", "Tasks")] || [];
    const missions = db[keyFor("missions", "Mission Log")] || [];

    const completed = missions.filter(item =>
      item.done || item.data?.status === "Completed"
    ).length;

    const setText = (selector, value) => {
      const element = $(selector);
      if (element) element.textContent = value;
    };

    setText("#active-count", Math.max(0, missions.length - completed));
    setText("#completion-rate", missions.length
      ? Math.round(completed / missions.length * 100) + "%"
      : "0%");
    setText("#task-count", tasks.length);
    setText("#focus-status", "READY");

    const area = $("#dashboard-tasks");
    if (area) {
      area.innerHTML = tasks.length
        ? tasks.slice(0, 4).map(item =>
            `<div class="af-dashboard-task">${esc(recordTitle(item))}</div>`
          ).join("")
        : `<div class="af-empty">No tasks recorded yet.</div>`;
    }

    setText("#briefing-date", new Date().toLocaleDateString());
    setText("#briefing-tasks", `${tasks.length} Tasks`);
    setText("#briefing-missions", `${missions.length} Missions`);
  }

  /* ---------------------------------------------------------
     15 — INITIALISATION
  --------------------------------------------------------- */

  function init() {
    if (!$("#page-home")) {
      console.error("ALFRED: Homepage HTML not found.");
      return;
    }

    createBootPanel();
    updateDashboard();
    updateClock();

    console.log(
      "ALFRED 2.0 ONLINE — " +
      Object.keys(departments).length +
      " DEPARTMENTS — SPECIALIST WORKSPACES READY"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
  
  })();