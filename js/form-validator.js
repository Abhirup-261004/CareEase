// simple form validation module - handles validation for contact and auth forms
// gives instant feedback to users without annoying them

class FormValidator {
  constructor(form) {
    this.form = form;
    this.errors = new Map();
    this.setupListeners();
  }

  // listen to input changes to validate in real-time
  setupListeners() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('change', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  // validate a single field based on its type and rules
  validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    let error = null;

    // check what kind of field this is and validate accordingly
    if (field.type === 'email') {
      if (!value) {
        error = 'Email is required';
      } else if (!this.isValidEmail(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (field.type === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 8) {
        error = 'Password must be at least 8 characters';
      }
    } else if (field.type === 'tel') {
      if (value && !this.isValidPhone(value)) {
        error = 'Please enter a valid phone number';
      }
    } else if (field.type === 'textarea') {
      if (!value) {
        error = 'This field is required';
      } else if (value.length < 10) {
        error = 'Message should be at least 10 characters';
      }
    } else if (field.tagName === 'SELECT') {
      if (!value) {
        error = 'Please select an option';
      }
    } else if (field.type === 'checkbox') {
      if (!field.checked) {
        error = 'Please agree to continue';
      }
    } else if (field.type === 'text') {
      // for regular text fields
      if (field.hasAttribute('required') && !value) {
        error = 'This field is required';
      } else if (value && value.length < 2) {
        error = 'Please enter a valid value';
      }
    }

    if (error) {
      this.setFieldError(field, error);
      this.errors.set(fieldName, error);
    } else {
      this.clearFieldError(field);
      this.errors.delete(fieldName);
    }

    return !error;
  }

  // check if all required fields are valid
  validateAll() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    let allValid = true;

    inputs.forEach(input => {
      if (input.hasAttribute('required') || input.type === 'email' || input.type === 'password') {
        if (!this.validateField(input)) {
          allValid = false;
        }
      }
    });

    return allValid;
  }

  // show error message under the field
  setFieldError(field, message) {
    // remove old error if it exists
    let errorEl = field.parentElement.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      field.parentElement.appendChild(errorEl);
    }

    errorEl.textContent = message;
    field.classList.add('has-error');
  }

  // remove error styling and message
  clearFieldError(field) {
    const errorEl = field.parentElement.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = '';
    }
    field.classList.remove('has-error');
  }

  // simple email validation regex
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // phone number validation - accepts common formats
  isValidPhone(phone) {
    // allows digits, spaces, dashes, parentheses, and + sign
    const regex = /^[\d\s\-\+\(\)]+$/;
    const cleanPhone = phone.replace(/\D/g, '');
    return regex.test(phone) && cleanPhone.length >= 10;
  }

  // get all current errors
  getErrors() {
    return Array.from(this.errors.entries());
  }

  // check if form has any errors
  hasErrors() {
    return this.errors.size > 0;
  }
}

// export for use in other files
window.FormValidator = FormValidator;
