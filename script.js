// ===== GLOBAL VARIABLES =====
let mouseX = 0;
let mouseY = 0;
let networkNodes = [];
let particles = [];

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function () {
  initializeNavigation();
  initializeNetworkBackground();
  initializeFloatingParticles();
  initializeTypingEffect();
  initializeScrollAnimations();
  initializeSkillBars();
  initializeProjectHovers();
  initializeContactForm();
  initializeParallaxEffects();
});

// ===== NAVIGATION =====
function initializeNavigation() {
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Mobile menu toggle
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close mobile menu when clicking on a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Active nav link highlighting
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll(".section, .hero-section");
    const scrollPos = window.pageYOffset + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("data-section") === sectionId) {
            link.classList.add("active");
          }
        });
      }
    });
  });

  // Smooth scroll for nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-section");
      scrollToSection(targetId);
    });
  });
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const offsetTop = section.offsetTop - 80; // Account for navbar height
    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  }
}

// ===== NETWORK BACKGROUND =====
function initializeNetworkBackground() {
  const canvas = document.getElementById("networkCanvas");
  const ctx = canvas.getContext("2d");

  // Declare shared state early
  let networkNodes = [];
  let mouseX = -9999,
    mouseY = -9999;

  // ---------- MOVE class definition HERE ----------
  class NetworkNode {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.originalX = x;
      this.originalY = y;
      this.type = type;
      this.radius = type === "hub" ? 8 : 4;
      this.connections = [];
      this.color = this.getColor();
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.velocity = { x: 0, y: 0 };
    }
    getColor() {
      const colors = {
        cybersecurity: "#ff3366",
        management: "#00ff88",
        data: "#00d4ff",
        development: "#ffaa00",
        satellite: "#f2f2f2",
      };
      return colors[this.type] || colors.satellite;
    }
    update() {
      const dx = mouseX - this.originalX;
      const dy = mouseY - this.originalY;
      const distance = Math.hypot(dx, dy);
      const maxDistance = 150;
      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        this.velocity.x += dx * force * 0.0005;
        this.velocity.y += dy * force * 0.0005;
      }
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.velocity.x *= 0.95;
      this.velocity.y *= 0.95;
      this.x += (this.originalX - this.x) * 0.02;
      this.y += (this.originalY - this.y) * 0.02;
    }
    draw() {
      const pulse = Math.sin(Date.now() * 0.003 + this.pulseOffset) * 0.3 + 0.7;
      const radius = this.radius * (this.type === "hub" ? pulse : 1);
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.type === "hub" ? 0.8 : 0.4;
      ctx.fill();
      if (this.type === "hub") {
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }
    drawConnections() {
      this.connections.forEach((connection) => {
        const distance = Math.hypot(
          this.x - connection.x,
          this.y - connection.y
        );
        if (distance < 200) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(connection.x, connection.y);
          ctx.strokeStyle = "#f2f2f2";
          ctx.globalAlpha = Math.max(0, 0.15 - distance / 1000);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      });
    }
  }
  // ------------------------------------------------

  function createNetworkNodes() {
    networkNodes = [];
    const hubs = [
      { x: canvas.width * 0.25, y: canvas.height * 0.3, type: "cybersecurity" },
      { x: canvas.width * 0.75, y: canvas.height * 0.3, type: "management" },
      { x: canvas.width * 0.25, y: canvas.height * 0.7, type: "data" },
      { x: canvas.width * 0.75, y: canvas.height * 0.7, type: "development" },
    ];
    hubs.forEach((hub) =>
      networkNodes.push(new NetworkNode(hub.x, hub.y, hub.type))
    );
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      networkNodes.push(new NetworkNode(x, y, "satellite"));
    }
    // connections (O(n^2) — OK for small counts)
    networkNodes.forEach((node, i) => {
      networkNodes.forEach((otherNode, j) => {
        if (i !== j) {
          const distance = Math.hypot(
            node.originalX - otherNode.originalX,
            node.originalY - otherNode.originalY
          );
          if (distance < 200) node.connections.push(otherNode);
        }
      });
    });
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createNetworkNodes();
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  function animateNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    networkNodes.forEach((n) => {
      n.update();
      n.drawConnections();
    });
    networkNodes.forEach((n) => n.draw());
    requestAnimationFrame(animateNetwork);
  }
  animateNetwork();
}

// ===== FLOATING PARTICLES =====
function initializeFloatingParticles() {
  const particlesContainer = document.getElementById("particles");

  class FloatingParticle {
    constructor() {
      this.element = document.createElement("div");
      this.element.classList.add("particle");
      this.reset();
      particlesContainer.appendChild(this.element);
    }

    reset() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.life = Math.random() * 100;

      this.element.style.left = this.x + "px";
      this.element.style.top = this.y + "px";
      this.element.style.animationDelay = Math.random() * 6 + "s";
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;

      // Wrap around screen
      if (this.x < 0) this.x = window.innerWidth;
      if (this.x > window.innerWidth) this.x = 0;
      if (this.y < 0) this.y = window.innerHeight;
      if (this.y > window.innerHeight) this.y = 0;

      this.element.style.left = this.x + "px";
      this.element.style.top = this.y + "px";

      if (this.life <= 0) {
        this.reset();
      }
    }
  }

  // Create particles
  for (let i = 0; i < 20; i++) {
    particles.push(new FloatingParticle());
  }

  function animateParticles() {
    particles.forEach((particle) => particle.update());
    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

// ===== TYPING EFFECT =====
function initializeTypingEffect() {
  const typingElement = document.querySelector(".typing-text");
  const text =
    "Software Engineer & Project Manager specializing in secure, scalable solutions with strategic methodology";
  let index = 0;

  function typeWriter() {
    if (index < text.length) {
      typingElement.textContent += text.charAt(index);
      index++;
      setTimeout(typeWriter, 50);
    }
  }

  // Start typing after hero animations
  setTimeout(typeWriter, 2000);
}

// ===== SCROLL ANIMATIONS =====
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Add animation classes to elements
  const animatedElements = document.querySelectorAll(
    ".section-header, .project-card, .cert-seal, .skill-category, .contact-item"
  );

  animatedElements.forEach((element) => {
    element.classList.add("fade-in");
    observer.observe(element);
  });
}

// ===== SKILL BARS ANIMATION =====
function initializeSkillBars() {
  const skillBars = document.querySelectorAll(".skill-progress");

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const skillBar = entry.target;
          const targetWidth = skillBar.getAttribute("data-width");

          setTimeout(() => {
            skillBar.style.width = targetWidth + "%";
          }, 300);
        }
      });
    },
    { threshold: 0.5 }
  );

  skillBars.forEach((bar) => {
    skillObserver.observe(bar);
  });
}

// ===== PROJECT CARD INTERACTIONS =====
function initializeProjectHovers() {
  const projectCards = document.querySelectorAll(".project-card");

  projectCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--mouse-x", x + "%");
      card.style.setProperty("--mouse-y", y + "%");
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--mouse-x", "50%");
      card.style.setProperty("--mouse-y", "50%");
    });
  });
}

// ===== PROJECT MODAL =====
const projectData = {
  traefik: {
    title: "Traefik Load Balancing Infrastructure",
    description:
      "A sophisticated multi-OS web infrastructure solution leveraging Docker containerization and Traefik reverse proxy for intelligent load balancing and automatic service discovery.",
    technologies: [
      "Docker",
      "Traefik",
      "Linux",
      "Windows",
      "Load Balancing",
      "Reverse Proxy",
    ],
    features: [
      "Multi-OS compatibility (Linux and Windows)",
      "Automatic service discovery and configuration",
      "SSL/TLS certificate management",
      "Health checks and failover mechanisms",
      "Real-time monitoring and logging",
      "Scalable microservices architecture",
    ],
    challenges: [
      "Cross-platform containerization complexities",
      "Dynamic load balancing configuration",
      "Security certificate automation",
      "Performance optimization across different OS environments",
    ],
    outcomes: [
      "Achieved 99.9% uptime across all services",
      "Reduced deployment time by 70%",
      "Improved system scalability and maintainability",
      "Enhanced security with automated SSL management",
    ],
    link: "https://sheer-mangosteen-78e.notion.site/Final-Exam-1f9a0d6b921f8008a54df366a26772c6",
  },
  auca: {
    title: "AUCA Innovation Center Competition Management",
    description:
      "Comprehensive project management of a university-wide fintech innovation competition, including strategic planning, stakeholder coordination, and custom grading system development.",
    technologies: ["Project Management", "PRINCE2", "Stakeholder Management"],
    features: [
      "End-to-end project lifecycle management",
      "Custom grading system development",
      "Multi-stakeholder coordination",
      "Risk assessment and mitigation strategies",
      "Resource allocation and budget management",
      "Timeline optimization and milestone tracking",
    ],
    challenges: [
      "Coordinating multiple stakeholder groups",
      "Balancing academic requirements with industry standards",
      "Developing fair and transparent evaluation criteria",
      "Managing tight deadlines with quality deliverables",
    ],
    outcomes: [
      "Successfully delivered project on time and within budget",
      "100 student participants across multiple Departments",
      "Established sustainable framework for future competitions",
      "Enhanced university-industry collaboration",
    ],
  },
  "un-dashboard": {
    title: "UN Big Data Analytics Dashboard",
    description:
      "This comprehensive big data analytics capstone project examines temperature change patterns across African countries using official FAOSTAT climate data from 2010-2020. The analysis combines advanced statistical methods, machine learning algorithms, and interactive visualization to provide evidence-based insights for climate adaptation policy development",
    technologies: [
      "Power BI",
      "Data Science",
      "Python",
      "SQL",
      "Data Visualization",
      "Analytics",
    ],
    features: [
      "Interactive data visualization dashboards",
      "Real-time data processing and updates",
      "Multi-dimensional analytical reporting",
      "Geographic data mapping and visualization",
      "Automated report generation",
    ],
    challenges: [
      "Handling large-scale global datasets",
      "Ensuring data accuracy and consistency",
      "Creating intuitive interfaces for non-technical users",
    ],
    outcomes: [
      "Streamlined decision-making processes",
      "Improved data accessibility for stakeholders",
      "Enhanced reporting efficiency by 60%",
      "Enabled data-driven policy recommendations",
    ],
  },
  "coffee-system": {
    title: "Enterprise Java Coffee Management System",
    description:
      "Robust enterprise-grade coffee shop management system built with Java and Hibernate ORM, featuring comprehensive inventory management, customer relations, and sales analytics.",
    technologies: ["Java", "Hibernate ORM", "MySQL"],
    features: [
      "Complete inventory management system",
      "Customer relationship management (CRM)",
      "Sales analytics and reporting",
      "Multi-location support",
      "Employee management and scheduling",
      "Automated reorder point calculations",
    ],
    challenges: [
      "Complex database relationships and optimization",
      "Real-time inventory synchronization",
      "Scalable architecture design",
      "Integration with existing POS systems",
    ],
    outcomes: [
      "Reduced inventory waste by 35%",
      "Improved customer service efficiency",
      "Streamlined multi-location operations",
      "Enhanced data-driven business insights",
    ],
  },
  "food-delivery": {
    title: "Responsive Food Delivery Application",
    description:
      "An early frontend development project showcasing mastery of responsive web design principles, creating an intuitive and visually appealing food delivery platform using modern HTML5 and CSS3 techniques.",
    technologies: [
      "HTML5",
      "CSS3",
      "Responsive Design",
      "JavaScript",
      "Mobile-First Approach",
    ],
    features: [
      "Fully responsive design across all devices",
      "Intuitive user interface and navigation",
      "Modern CSS3 animations and transitions",
      "Mobile-first responsive approach",
      "Cross-browser compatibility",
      "Accessibility-compliant design",
    ],
    challenges: [
      "Creating pixel-perfect responsive layouts",
      "Ensuring consistent experience across devices",
      "Optimizing performance and loading times",
      "Implementing modern design trends",
    ],
    outcomes: [
      "Achieved 100% mobile responsiveness score",
      "Demonstrated strong frontend development skills",
      "Created reusable component library",
      "Established foundation for advanced web development",
    ],
  },
};

function openProjectModal(projectKey) {
  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  const project = projectData[projectKey];

  if (!project) return;

  modalTitle.textContent = project.title;

  modalBody.innerHTML = `
        <div class="project-detail-content">
            <div class="project-description">
                <h4>Project Overview</h4>
                <p>${project.description}</p>
            </div>
            
            <div class="project-technologies">
                <h4>Technologies Used</h4>
                <div class="tech-tags">
                    ${project.technologies
                      .map((tech) => `<span class="tech-tag">${tech}</span>`)
                      .join("")}
                </div>
            </div>
            
            <div class="project-features">
                <h4>Key Features</h4>
                <ul class="feature-list">
                    ${project.features
                      .map((feature) => `<li>${feature}</li>`)
                      .join("")}
                </ul>
            </div>
            
            <div class="project-challenges">
                <h4>Challenges Overcome</h4>
                <ul class="challenge-list">
                    ${project.challenges
                      .map((challenge) => `<li>${challenge}</li>`)
                      .join("")}
                </ul>
            </div>
            
            <div class="project-outcomes">
                <h4>Results & Impact</h4>
                <ul class="outcome-list">
                    ${project.outcomes
                      .map((outcome) => `<li>${outcome}</li>`)
                      .join("")}
                </ul>
            </div>
            
            ${
              project.link
                ? `
                <div class="project-links">
                    <a href="${project.link}" target="_blank" class="project-external-link">
                        View Documentation <span>→</span>
                    </a>
                </div>
            `
                : ""
            }
        </div>
    `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  const modal = document.getElementById("projectModal");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Close modal when clicking outside
document.getElementById("projectModal").addEventListener("click", (e) => {
  if (e.target.id === "projectModal") {
    closeProjectModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProjectModal();
  }
});

// ===== CONTACT FORM =====
function initializeContactForm() {
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name") || document.getElementById("name").value;
    const email =
      formData.get("email") || document.getElementById("email").value;
    const message =
      formData.get("message") || document.getElementById("message").value;

    // Simulate form submission
  const submitBtn = form.querySelector(".submit-btn");
const originalText = submitBtn.querySelector("span").textContent;

submitBtn.addEventListener("click", function (e) {
  e.preventDefault(); // stop form from reloading the page

  submitBtn.querySelector("span").textContent = "Sending...";
  submitBtn.disabled = true;

  // Get the message the user typed
  const userMessage = document.getElementById("message").value.trim();

  // If message is empty, stop here
  if (!userMessage) {
    alert("Please type a message before sending.");
    submitBtn.querySelector("span").textContent = originalText;
    submitBtn.disabled = false;
    return;
  }

  // Prepare Gmail compose URL
  const email = "sam.ngomi100@gmail.com";
  const subject = encodeURIComponent("Hello Samuel");
  const body = encodeURIComponent(userMessage);

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
  window.open(gmailUrl, "_blank");

  // Simulate success message on button
  setTimeout(() => {
    submitBtn.querySelector("span").textContent = "Message Sent!";

    setTimeout(() => {
      submitBtn.querySelector("span").textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
    }, 2000);
  }, 1500);
});
    });
}

// ===== PARALLAX EFFECTS =====
function initializeParallaxEffects() {
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    // Parallax effect for hero background
    const heroSection = document.querySelector(".hero-section");
    if (heroSection) {
      heroSection.style.transform = `translateY(${rate}px)`;
    }
  });
}

// ===== PERFORMANCE OPTIMIZATIONS =====
// Throttle scroll events for better performance
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Apply throttling to scroll-heavy functions
window.addEventListener(
  "scroll",
  throttle(() => {
    
  }, 16)
); 

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Smooth reveal animations on scroll
function revealOnScroll() {
  const reveals = document.querySelectorAll(
    ".fade-in, .slide-in-left, .slide-in-right, .scale-in"
  );

  reveals.forEach((element) => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      element.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", debounce(revealOnScroll, 10));

// ===== EASTER EGGS & INTERACTIVE ELEMENTS =====
// Konami Code easter egg
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiIndex = 0;

document.addEventListener("keydown", (e) => {
  if (e.keyCode === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      // Activate special animation
      document.body.style.animation = "rainbow 2s linear infinite";
      setTimeout(() => {
        document.body.style.animation = "";
      }, 10000);
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

// Add rainbow animation keyframes dynamically
const style = document.createElement("style");
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    .project-detail-content {
        padding: 1rem 0;
    }
    
    .project-detail-content h4 {
        color: var(--electric-blue);
        font-family: 'Inter', sans-serif;
        font-size: 1.2rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        position: relative;
    }
    
    .project-detail-content h4:first-child {
        margin-top: 0;
    }
    
    .project-detail-content h4::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 30px;
        height: 2px;
        background: var(--electric-blue);
    }
    
    .project-description p {
        color: var(--text-secondary);
        line-height: 1.7;
        margin-bottom: 1rem;
    }
    
    .tech-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .tech-tag {
        padding: 0.4rem 0.8rem;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 15px;
        font-size: 0.85rem;
        color: var(--text-primary);
        transition: all 0.3s ease;
    }
    
    .tech-tag:hover {
        background: var(--electric-blue);
        color: var(--bg-primary);
    }
    
    .feature-list,
    .challenge-list,
    .outcome-list {
        list-style: none;
        padding: 0;
        margin: 1rem 0;
    }
    
    .feature-list li,
    .challenge-list li,
    .outcome-list li {
        position: relative;
        padding-left: 1.5rem;
        margin-bottom: 0.8rem;
        color: var(--text-secondary);
        line-height: 1.6;
    }
    
    .feature-list li::before {
        position: absolute;
        left: 0;
        color: var(--emerald-green);
        font-weight: bold;
    }
    
    .challenge-list li::before {
        position: absolute;
        left: 0;
        color: var(--warm-amber);
    }
    
    .outcome-list li::before {
        position: absolute;
        left: 0;
        color: var(--electric-blue);
    }
    
    .project-external-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, var(--electric-blue), var(--emerald-green));
        color: var(--bg-primary);
        text-decoration: none;
        border-radius: 25px;
        font-weight: 600;
        transition: all 0.3s ease;
        margin-top: 2rem;
    }
    
    .project-external-link:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px var(--shadow-glow);
    }
    
    .project-external-link span {
        transition: transform 0.3s ease;
    }
    
    .project-external-link:hover span {
        transform: translateX(5px);
    }
`;
document.head.appendChild(style);

// ===== ADVANCED ANIMATIONS =====
function createButtonParticles(button) {
  const particles = button.querySelector(".button-particles");
  if (!particles) return;

  for (let i = 0; i < 6; i++) {
    const particle = document.createElement("div");
    particle.style.position = "absolute";
    particle.style.width = "4px";
    particle.style.height = "4px";
    particle.style.background = "currentColor";
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";

    const angle = (i / 6) * Math.PI * 2;
    const distance = 30;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    particle.style.left = "50%";
    particle.style.top = "50%";
    particle.style.transform = `translate(-50%, -50%)`;

    particles.appendChild(particle);

    // Animate particle
    particle.animate(
      [
        {
          transform: `translate(-50%, -50%) translate(0, 0)`,
          opacity: 1,
        },
        {
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          opacity: 0,
        },
      ],
      {
        duration: 600,
        easing: "ease-out",
      }
    ).onfinish = () => {
      particle.remove();
    };
  }
}

// Add particle effects to CTA buttons
document.querySelectorAll(".cta-button, .submit-btn").forEach((button) => {
  button.addEventListener("click", () => {
    createButtonParticles(button);
  });
});

// ===== DYNAMIC THEME ADJUSTMENTS =====
function adjustThemeBasedOnTime() {
  const hour = new Date().getHours();
  const root = document.documentElement;

  if (hour >= 6 && hour < 18) {
    // Day theme adjustments
    root.style.setProperty("--bg-primary", "#1a1a1a");
    root.style.setProperty("--glass-bg", "rgba(255, 255, 255, 0.05)");
  } else {
    // Night theme adjustments
    root.style.setProperty("--bg-primary", "#0f0f0f");
    root.style.setProperty("--glass-bg", "rgba(255, 255, 255, 0.03)");
  }
}

// Apply theme on load
adjustThemeBasedOnTime();

// ===== PERFORMANCE MONITORING =====
function logPerformanceMetrics() {
  if ("performance" in window) {
    window.addEventListener("load", () => {
      const perfData = performance.getEntriesByType("navigation")[0];
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;

      console.log("🚀 Portfolio Performance Metrics:");
      console.log(`⏱️ Total Load Time: ${loadTime}ms`);
      console.log(
        `🖼️ DOM Content Loaded: ${
          perfData.domContentLoadedEventEnd -
          perfData.domContentLoadedEventStart
        }ms`
      );
      console.log(
        `🌐 Network Time: ${perfData.responseEnd - perfData.requestStart}ms`
      );
    });
  }
}

logPerformanceMetrics();

// ===== ACCESSIBILITY ENHANCEMENTS =====
function enhanceAccessibility() {
  // Add focus management for modal
  const modal = document.getElementById("projectModal");
  const focusableElements =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  modal.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const focusableContent = modal.querySelectorAll(focusableElements);
      const firstFocusableElement = focusableContent[0];
      const lastFocusableElement =
        focusableContent[focusableContent.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
  });

  // Add skip-to-content link
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.textContent = "Skip to main content";
  skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--electric-blue);
        color: var(--bg-primary);
        padding: 8px;
        z-index: 10000;
        text-decoration: none;
        border-radius: 4px;
        transition: top 0.3s;
    `;

  skipLink.addEventListener("focus", () => {
    skipLink.style.top = "6px";
  });

  skipLink.addEventListener("blur", () => {
    skipLink.style.top = "-40px";
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main content landmark
  const heroSection = document.getElementById("home");
  if (heroSection && !heroSection.getAttribute("role")) {
    heroSection.setAttribute("id", "main-content");
    heroSection.setAttribute("role", "main");
  }
}

enhanceAccessibility();

// ===== ADVANCED SCROLL EFFECTS =====
function initializeAdvancedScrollEffects() {
  let ticking = false;

  function updateScrollEffects() {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Calculate scroll progress
    const scrollProgress = scrolled / (documentHeight - windowHeight);

    // Update CSS custom property for scroll-based animations
    document.documentElement.style.setProperty(
      "--scroll-progress",
      scrollProgress
    );

    // Parallax effects for different sections
    const parallaxElements = document.querySelectorAll("[data-parallax]");
    parallaxElements.forEach((element) => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });

    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestScrollUpdate);
}

initializeAdvancedScrollEffects();

// ===== INTERSECTION OBSERVER FOR COMPLEX ANIMATIONS =====
function initializeComplexAnimations() {
  const observerOptions = {
    threshold: [0, 0.25, 0.5, 0.75, 1],
    rootMargin: "-10% 0px",
  };

  const complexObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target;
      const intersectionRatio = entry.intersectionRatio;

      if (element.classList.contains("skill-progress")) {
        // Animate skill bars based on intersection ratio
        const targetWidth = element.getAttribute("data-width");
        const currentWidth = targetWidth * intersectionRatio;
        element.style.width = `${currentWidth}%`;
      }

      if (element.classList.contains("cert-seal")) {
        // Rotate certification seals based on scroll
        const rotation = intersectionRatio * 360;
        element.style.transform = `rotate(${rotation}deg) scale(${
          0.8 + intersectionRatio * 0.2
        })`;
      }
    });
  }, observerOptions);

  // Observe elements for complex animations
  document
    .querySelectorAll(".skill-progress, .cert-seal")
    .forEach((element) => {
      complexObserver.observe(element);
    });
}
// Opening the Url for different platforms
const openLink = (selector, url) => {
    document.querySelector(selector).addEventListener("click", () => {
      window.open(url, "_blank");
    });
  };

  // Use it for GitHub
  openLink(".go_to_github", "https://github.com/Roman-45");

  // Use it for LinkedIn
  openLink(".go_to_linkedIn", "https://www.linkedin.com/in/samuel-ngomi-967b621b4/");


// Initialize complex animations after DOM is ready
setTimeout(initializeComplexAnimations, 1000);

// ===== RESPONSIVE IMAGE LOADING =====
function initializeLazyLoading() {
  const images = document.querySelectorAll("img[data-src]");

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

initializeLazyLoading();

// ===== CONTEXT MENU CUSTOMIZATION =====
document.addEventListener("contextmenu", (e) => {
  if (e.target.closest(".project-card, .cert-seal")) {
    e.preventDefault();

    // Create custom context menu
    const contextMenu = document.createElement("div");
    contextMenu.style.cssText = `
            position: fixed;
            top: ${e.pageY}px;
            left: ${e.pageX}px;
            background: var(--bg-secondary);
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            padding: 0.5rem;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

    contextMenu.innerHTML = `
            <div style="padding: 0.5rem 1rem; color: var(--text-primary); cursor: pointer; border-radius: 4px;">
                View Details
            </div>
        `;

    document.body.appendChild(contextMenu);

    // Remove context menu on click elsewhere
    const removeContextMenu = () => {
      contextMenu.remove();
      document.removeEventListener("click", removeContextMenu);
    };

    setTimeout(() => {
      document.addEventListener("click", removeContextMenu);
    }, 100);
  }
});
