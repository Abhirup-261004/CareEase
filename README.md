# CareEase

**CareEase** is a lightweight, front-end project for a **healthcare helper app**. It includes a modern landing page, About/Contact pages, a dedicated Auth page (Sign in / Sign up / Forgot password), and a Reminders page to help users track health tasks and appointments.

<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## ✨ Features

- **Modern landing page** with CTA to get started  
- **Auth flow**: Sign In, Sign Up, and Forgot Password in one page (`auth.html`)  
- **Reminders**: create and manage simple reminders (front-end only)  
- **About & Contact** pages with consistent theme  
- **Responsive UI** (HTML/CSS/JS; no frameworks)

<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />


## 🔧 Tech Stack

- **HTML5** for markup  
- **CSS3** for styling (plus `auth.css`)  
- **Vanilla JavaScript** for interactions (`/js` and `auth.js`)  
- **Assets** served locally from `/assets`

<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />


## 📁 Project Structure

CareEase/
├─ assets/ # images, icons, media
├─ css/ # shared CSS files
├─ js/ # shared JS files
├─ index.html # landing page
├─ about.html # about page
├─ contact.html # contact page
├─ reminders.html # reminders UI
├─ auth.html # sign in / sign up / forgot password
├─ auth.css # styles for auth page
└─ auth.js # logic for toggling auth views

<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />


## 🚀 Getting Started

Because this is a static site, you can run it in two simple ways:

### Option A — Open in browser

1. Download or clone the repo

   ```bash
   git clone https://github.com/Abhirup-261004/CareEase.git
   cd CareEase
   
2. Double-click index.html to open it in your browser.

### Option B — Live Server (recommended)

1. Install the Live Server VS Code extension.

2. Open the folder in VS Code → Right-click index.html → Open with Live Server.

<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />


## 🧪 Development Notes

The Auth page (auth.html) switches between Sign In / Sign Up / Forgot Password via UI tabs (handled in auth.js).
The Reminders page is front-end only. For persistence, you can:
start with localStorage, or
connect to a real API later.

<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />


## 🛤️ Roadmap

- Hook auth forms to a backend (Node/Express or Firebase)
- Persist reminders (localStorage → API)
- Form validation & toasts

<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />


## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch: git checkout -b feat/your-feature
3. Commit: git commit -m "Add your feature"
4. Push: git push origin feat/your-feature
5. Open a Pull Request

<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />


## Code Style
- Keep HTML semantic (use `<main>`, `<section>`, `<nav>`, etc.) to improve accessibility and maintainable structure.
- Organize CSS with clear sections; prefer utility classes over deep nesting
- Keep JS modular and small; avoid global variables where possible

<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />
 
## Screenshots

### Landing Page
![Landing Page](assets/Landing.png)

### Contact Form
![Contact form](assets/ContactForm.png)

### Reminders
![Set Reminders](assets/Reminders.png)

### Dark Mode
![Dark Mode](assets/DarkMode.png)
