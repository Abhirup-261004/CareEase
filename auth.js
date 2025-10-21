document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const panes = document.querySelectorAll(".pane");
  const links = document.querySelectorAll("[data-switch]");
  const signInForm = panes[0];
  const signUpForm = panes[1];
  const forgotForm = document.getElementById("forgotForm");

  // validators for each form
  let signInValidator = null;
  let signUpValidator = null;
  let forgotValidator = null;

  // switch between sign in, sign up, and forgot password forms
  function showPane(name) {
    panes.forEach(p => {
      p.hidden = p.dataset.pane !== name;
      p.classList.toggle("active", p.dataset.pane === name);
    });
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));

    // initialize validator for the active pane
    if (name === 'signin' && signInValidator) {
      signInValidator.setupListeners();
    } else if (name === 'signup' && signUpValidator) {
      signUpValidator.setupListeners();
    } else if (name === 'forgot' && forgotValidator) {
      forgotValidator.setupListeners();
    }
  }

  // set up validators for each form
  if (signInForm) {
    signInValidator = new FormValidator(signInForm);
    signInForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (signInValidator.validateAll()) {
        handleSignIn(signInForm);
      }
    });
  }

  if (signUpForm) {
    signUpValidator = new FormValidator(signUpForm);
    signUpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (signUpValidator.validateAll()) {
        handleSignUp(signUpForm);
      }
    });
  }

  if (forgotForm) {
    forgotValidator = new FormValidator(forgotForm);
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (forgotValidator.validateAll()) {
        handleForgotPassword(forgotForm);
      }
    });
  }

  // handle sign in form submission
  function handleSignIn(form) {
    const email = form.email.value.trim();
    const password = form.password.value;

    // here you would send to your backend
    console.log('Sign in:', { email, password });
    alert(`Welcome back! We're logging you in...`);
    form.reset();
    showPane('signin');
  }

  // handle sign up form submission
  function handleSignUp(form) {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    // here you would send to your backend
    console.log('Sign up:', { name, email, password });
    alert(`Welcome to CareEase! Your account has been created.`);
    form.reset();
    showPane('signin');
  }

  // handle forgot password form submission
  function handleForgotPassword(form) {
    const email = form.email.value.trim();

    // here you would send to your backend
    console.log('Reset password for:', email);
    alert(`A password reset link has been sent to ${email}`);
    form.reset();
    showPane('signin');
  }

  // tab switching
  tabs.forEach(tab => {
    tab.addEventListener("click", () => showPane(tab.dataset.tab));
  });

  // link-based switching (for "Already have account?" etc)
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showPane(link.dataset.switch);
    });
  });

  // password visibility toggle
  document.querySelectorAll(".password-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.textContent = isPassword ? "🙈" : "👁️";
    });
  });
});
