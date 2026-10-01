// Small interactive details + Three.js animated 3D particle field.
document.getElementById("year").textContent = new Date().getFullYear();

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

const glow = document.querySelector(".cursor-glow");
window.addEventListener("pointermove", event => {
  glow.style.left = event.clientX + "px";
  glow.style.top = event.clientY + "px";
}, { passive: true });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".section-block, .project-card, .stat-card, .skill-group, .skill-feature").forEach(el => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

// Three.js is progressive enhancement: the portfolio still works if CDN/WebGL is unavailable.
(function createThreeScene() {
  if (!window.THREE) return;
  const hero = document.querySelector(".hero");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  } catch (error) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setSize(hero.clientWidth, hero.clientHeight);
  renderer.domElement.id = "three-bg";
  hero.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, hero.clientWidth / hero.clientHeight, 0.1, 100);
  camera.position.z = 16;

  const group = new THREE.Group();
  scene.add(group);

  // Floating points form a gently rotating 3D cloud around the hero content.
  const count = 650;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const radius = 5 + Math.random() * 11;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    const tint = Math.random();
    colors[i3] = tint < .65 ? .38 : .63;
    colors[i3 + 1] = tint < .65 ? .95 : .53;
    colors[i3 + 2] = tint < .65 ? .88 : 1;
    sizes[i] = .5 + Math.random() * 1.8;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: .045, vertexColors: true, transparent: true, opacity: .72,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const points = new THREE.Points(geometry, material);
  group.add(points);

  // A fine wireframe icosahedron adds a subtle 3D object in the background.
  const wireGeometry = new THREE.IcosahedronGeometry(2.3, 1);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x79f2e3, wireframe: true, transparent: true, opacity: .11
  });
  const wire = new THREE.Mesh(wireGeometry, wireMaterial);
  wire.position.set(5.1, .1, -2.5);
  group.add(wire);

  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  hero.addEventListener("pointermove", e => {
    const rect = hero.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width - .5) * .45;
    targetY = ((e.clientY - rect.top) / rect.height - .5) * .3;
  }, { passive: true });

  let frame;
  const clock = new THREE.Clock();
  function animate() {
    frame = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mouseX += (targetX - mouseX) * .025;
    mouseY += (targetY - mouseY) * .025;
    group.rotation.y = t * .025 + mouseX;
    group.rotation.x = Math.sin(t * .12) * .035 + mouseY;
    points.rotation.z = t * .012;
    wire.rotation.x = t * .12;
    wire.rotation.y = t * .16;
    renderer.render(scene, camera);
  }
  animate();

  function resize() {
    const width = hero.clientWidth, height = hero.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else animate();
  });
})();

const certificateModal = document.getElementById("certificate-modal");
const certificateClose = document.querySelector(".certificate-close");
const certificateTrigger = document.querySelector("[data-open-certificate]");

function toggleCertificateModal(open) {
  if (!certificateModal) return;
  certificateModal.classList.toggle("is-open", open);
  certificateModal.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
}

if (certificateTrigger) {
  certificateTrigger.addEventListener("click", event => {
    event.preventDefault();
    toggleCertificateModal(true);
  });
}

if (certificateClose) {
  certificateClose.addEventListener("click", () => toggleCertificateModal(false));
}

if (certificateModal) {
  certificateModal.addEventListener("click", event => {
    if (event.target.hasAttribute("data-close-certificate") || event.target === certificateModal) {
      toggleCertificateModal(false);
    }
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && certificateModal && certificateModal.classList.contains("is-open")) {
    toggleCertificateModal(false);
  }
});

const assistantToggle = document.querySelector(".assistant-toggle");
const assistantPanel = document.querySelector(".assistant-panel");
const assistantClose = document.querySelector(".assistant-close");
const assistantForm = document.querySelector(".assistant-form");
const assistantInput = document.querySelector("#assistant-question");
const assistantMessages = document.querySelector("#assistant-messages");
const assistantMic = document.querySelector("#assistant-mic");

function setAssistantOpen(open) {
  assistantPanel.hidden = !open;
  assistantToggle.setAttribute("aria-expanded", String(open));
  if (open) assistantInput.focus();
  else assistantToggle.focus();
}

assistantToggle.addEventListener("click", () => setAssistantOpen(assistantPanel.hidden));
assistantClose.addEventListener("click", () => setAssistantOpen(false));

function getPortfolioAnswer(question) {
  const query = question.trim().toLowerCase();
  if (/who is atul|about atul|tell me about atul|portfolio/.test(query)) {
    return "Atul Kumar is a Computer Science Engineering diploma graduate and aspiring developer from India. This portfolio covers his skills, projects, education, and contact details.";
  }
  if (/skill|technology|tech|program|language|tool/.test(query)) {
    return "Atul lists C, C++, Java, Python, MATLAB, JavaScript, HTML, and CSS. His computer science subjects include data structures, operating systems, DBMS, and computer networks.";
  }
  if (/project|work|built|portfolio|student management/.test(query)) {
    return "Featured projects include Atul's personal portfolio, an academic Student Management System concept, and Nexora AI Web Builder, a live AI-powered tool for generating, editing, previewing, and publishing websites.";
  }
  if (/education|study|college|school|cgpa|grade/.test(query)) {
    return "Atul is a Computer Science Engineering diploma graduate with an 8.2 CGPA. He completed Class 10 at Dolphin Public School with 74%.";
  }
  if (/resume|cv|download/.test(query)) {
    return "You can download Atul's resume from the Download resume button near the top of this page.";
  }
  if (/email|mail|whatsapp|whats.?app|phone|contact|reach/.test(query)) {
    return "Email Atul at singhatul20095@gmail.com or message him on WhatsApp at +91 87072 10511 using the contact buttons below.";
  }
  if (/github|linkedin|social/.test(query)) {
    return "Open Atul's GitHub or LinkedIn profile using the social buttons beside the resume download near the top of the page.";
  }
  if (/matlab/.test(query)) {
    return "MATLAB is a programming and numerical-computing environment used for matrix calculations, data analysis, visualization, and engineering simulations. Atul has also listed MATLAB among his skills.";
  }
  if (/c\+\+|\bcpp\b/.test(query)) {
    return "C++ is a compiled programming language used for performance-sensitive software, games, systems programming, and problem solving. It supports both procedural and object-oriented programming.";
  }
  if (/\bjava\b/.test(query)) {
    return "Java is a widely used, class-based programming language. It runs on the Java Virtual Machine and is common in backend services, Android development, and enterprise software.";
  }
  if (/\bpython\b/.test(query)) {
    return "Python is a readable, general-purpose programming language used in automation, web development, data analysis, and artificial intelligence.";
  }
  if (/\bhtml\b|web page|website/.test(query)) {
    return "HTML gives a web page its structure. CSS controls its presentation, and JavaScript adds behavior and interaction. Together they are the foundation of front-end web development.";
  }
  if (/\bcss\b/.test(query)) {
    return "CSS controls the appearance and layout of web pages, including typography, color, responsive layouts, transitions, and animations.";
  }
  if (/javascript/.test(query)) {
    return "JavaScript is the programming language of the web. In a browser it can respond to user actions, update page content, and power interactive applications.";
  }
  if (/artificial intelligence|\bai\b|machine learning/.test(query)) {
    return "Artificial intelligence is a broad field focused on systems that perform tasks such as recognizing patterns, understanding language, or making predictions. Machine learning is one approach where systems learn patterns from data.";
  }
  if (/data structure|algorithm/.test(query)) {
    return "Data structures organize information for efficient use. Arrays, linked lists, stacks, queues, trees, and hash tables each suit different operations; algorithms describe the steps used to solve a problem.";
  }
  if (/operating system|\bos\b/.test(query)) {
    return "An operating system manages a computer's hardware and provides services for applications, including process scheduling, memory, files, and device access.";
  }
  if (/\bdbms\b|database/.test(query)) {
    return "A DBMS, or database management system, stores and manages data. It helps applications query, update, organize, and protect information.";
  }
  if (/computer network|networking/.test(query)) {
    return "Computer networking connects devices so they can exchange data. Core ideas include IP addressing, routing, protocols, and reliable communication.";
  }
  if (/how are you|hello|hi\b|hey\b/.test(query)) {
    return "Hello! I'm ready to help with Atul's portfolio or explain a programming and web-development topic. Try asking about MATLAB, AI, data structures, or web basics.";
  }
  return "I can explain Atul's portfolio and selected topics in programming, web development, AI, MATLAB, databases, operating systems, and networks. This assistant uses built-in answers and does not have live internet access; try asking about one of those topics.";
}

function appendAssistantMessage(text, className = "assistant-message") {
  const message = document.createElement("p");
  message.className = className;
  message.textContent = text;
  assistantMessages.append(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
  return message;
}

function speakAssistantAnswer(text) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 0.96;
  window.speechSynthesis.speak(utterance);
}

let activeRecognition = null;
assistantMic.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    appendAssistantMessage("Voice input is not supported in this browser. You can type your question instead.");
    return;
  }
  if (activeRecognition) {
    activeRecognition.stop();
    return;
  }

  const recognition = new SpeechRecognition();
  activeRecognition = recognition;
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  assistantMic.classList.add("is-listening");
  assistantMic.setAttribute("aria-label", "Stop voice input");
  recognition.onresult = event => {
    assistantInput.value = event.results[0][0].transcript;
    assistantForm.requestSubmit();
  };
  recognition.onerror = event => {
    if (event.error !== "aborted" && event.error !== "no-speech") {
      appendAssistantMessage("I couldn't access the microphone. Check browser mic permission, or type your question.");
    }
  };
  recognition.onend = () => {
    activeRecognition = null;
    assistantMic.classList.remove("is-listening");
    assistantMic.setAttribute("aria-label", "Ask by voice");
  };
  try {
    recognition.start();
  } catch (error) {
    activeRecognition = null;
    assistantMic.classList.remove("is-listening");
    assistantMic.setAttribute("aria-label", "Ask by voice");
    appendAssistantMessage("Voice input could not start. Please type your question instead.");
  }
});

assistantForm.addEventListener("submit", event => {
  event.preventDefault();
  const question = assistantInput.value.trim();
  if (!question) return;

  appendAssistantMessage(question, "assistant-message assistant-message-user");
  const answer = getPortfolioAnswer(question);
  appendAssistantMessage(answer);
  assistantInput.value = "";
  speakAssistantAnswer(answer);
});
