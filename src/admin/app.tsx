import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [],
  },
  bootstrap(app: StrapiApp) {
    console.log('🚀 STRAPI ADMIN APP LOADED');
    
    // Add a script to pre-fill email on registration page
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        // Check if we're on the registration page
        if (window.location.pathname === '/admin/auth/register') {
          console.log('📋 On registration page');
          
          // Get URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const email = urlParams.get('email');
          const confirmationToken = urlParams.get('confirmationToken');
          
          console.log('📧 Email parameter:', email);
          console.log('🔑 Confirmation token:', confirmationToken ? 'found' : 'not found');
          
          if (email) {
            // Wait for form to load and pre-fill email
            const checkForm = setInterval(() => {
              const emailInputs = document.querySelectorAll('input[type="email"]');
              emailInputs.forEach(input => {
                if (!input.value && email) {
                  input.value = email;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                  input.dispatchEvent(new Event('blur', { bubbles: true }));
                  console.log('✅ Email pre-filled:', email);
                  clearInterval(checkForm);
                }
              });
            }, 100);
            
            setTimeout(() => clearInterval(checkForm), 5000);
          }
          
          if (confirmationToken) {
            // Intercept form submission to add confirmation token
            const interceptForm = setInterval(() => {
              const forms = document.querySelectorAll('form');
              forms.forEach(form => {
                if (!form.dataset.tokenIntercepted) {
                  form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    console.log('📝 Form submitted');
                    
                    // Find all inputs and collect ONLY required fields
                    const inputs = form.querySelectorAll('input');
                    let formData = {};
                    
                    inputs.forEach(input => {
                      // Only collect: email, username, password
                      if (['email', 'username', 'password'].includes(input.name) && input.value) {
                        formData[input.name] = input.value;
                      }
                    });
                    
                    // Add confirmation token
                    formData.confirmationToken = confirmationToken;
                    console.log('🔑 Added confirmation token to form data');
                    console.log('📦 Form data:', formData);
                    
                    // Show loading state
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton) {
                      submitButton.disabled = true;
                      submitButton.textContent = 'Registering...';
                    }
                    
                    try {
                      console.log('🔄 Sending registration request...');
                      const response = await fetch('/api/registration/confirm', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                      });
                      
                      console.log('📥 Response status:', response.status);
                      
                      const data = await response.json();
                      console.log('📦 Response data:', data);
                      
                      if (response.ok && data.jwt) {
                        console.log('✅ Registration successful');
                        
                        // Store JWT
                        localStorage.setItem('jwt', data.jwt);
                        localStorage.setItem('userInfo', JSON.stringify(data.user));
                        
                        console.log('✅ JWT stored, redirecting...');
                        
                        // Redirect to admin
                        setTimeout(() => {
                          window.location.href = '/admin';
                        }, 500);
                      } else {
                        console.error('❌ Registration failed:', data);
                        alert(data.error?.message || data.message || 'Registration failed');
                        
                        // Reset button
                        if (submitButton) {
                          submitButton.disabled = false;
                          submitButton.textContent = 'Register';
                        }
                      }
                    } catch (error) {
                      console.error('❌ Registration error:', error);
                      alert('An error occurred during registration');
                      
                      // Reset button
                      if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Register';
                      }
                    }
                  });
                  form.dataset.tokenIntercepted = 'true';
                  console.log('✅ Form submission interceptor added');
                  clearInterval(interceptForm);
                }
              });
            }, 100);
            
            setTimeout(() => clearInterval(interceptForm), 5000);
          }
        }
      })();
    `;
    
    document.head.appendChild(script);
  },
};
