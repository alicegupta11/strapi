/**
 * Script to pre-fill Strapi's default registration form
 * This script automatically runs on the registration page
 */
(function() {
  // Wait for the page to load
  window.addEventListener('load', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const username = urlParams.get('username');
    const inviteToken = urlParams.get('inviteToken');

    // Store invite token for later use during registration
    if (inviteToken) {
      sessionStorage.setItem('inviteToken', inviteToken);
    }

    // Function to fill form fields
    function fillForm() {
      // Try to find email input field
      const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email"], input[placeholder*="email"]');
      const emailInput = Array.from(emailInputs).find(input => input.offsetParent !== null);
      
      // Try to find username input field
      const usernameInputs = document.querySelectorAll('input[type="text"], input[name*="username"], input[name*="name"], input[placeholder*="username"], input[placeholder*="name"]');
      const usernameInput = Array.from(usernameInputs).find(input => {
        return input.offsetParent !== null && 
               !emailInputs.includes(input) && 
               !input.placeholder?.toLowerCase().includes('password');
      });

      // Fill email field
      if (email && emailInput) {
        emailInput.value = email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Email pre-filled:', email);
      }

      // Fill username field
      if (username && usernameInput) {
        usernameInput.value = username;
        usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
        usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Username pre-filled:', username);
      }

      // Mark fields as read-only if we have invite token
      if (inviteToken) {
        if (emailInput) {
          emailInput.readOnly = true;
          emailInput.style.backgroundColor = '#f5f5f5';
          emailInput.style.cursor = 'not-allowed';
        }
        if (usernameInput) {
          usernameInput.readOnly = true;
          usernameInput.style.backgroundColor = '#f5f5f5';
          usernameInput.style.cursor = 'not-allowed';
        }
        console.log('✅ Fields locked with invite token');
      }
    }

    // Try to fill form immediately
    fillForm();

    // Also try after a short delay (in case form is loaded dynamically)
    setTimeout(fillForm, 500);
    setTimeout(fillForm, 1500);

    // Intercept form submission to include invite token
    function interceptForm() {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          const inviteToken = sessionStorage.getItem('inviteToken');
          if (inviteToken) {
            // Create hidden input for invite token
            let tokenInput = form.querySelector('[name="inviteToken"]');
            if (!tokenInput) {
              tokenInput = document.createElement('input');
              tokenInput.type = 'hidden';
              tokenInput.name = 'inviteToken';
              tokenInput.value = inviteToken;
              form.appendChild(tokenInput);
            }
            console.log('✅ Invite token added to form submission');
          }
        });
      });
    }

    // Intercept forms
    interceptForm();
    setTimeout(interceptForm, 500);
  });
})();
