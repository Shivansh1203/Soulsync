/**
 * Appointment form — sends to riyamalik2019@gmail.com via Web3Forms.
 *
 * One-time setup (takes ~1 minute):
 * 1. Open https://web3forms.com
 * 2. Enter riyamalik2019@gmail.com and click "Create Access Key"
 * 3. Copy the key and paste it below (replace REPLACE_WITH_YOUR_ACCESS_KEY)
 */
function initAppointmentForm() {
  'use strict';

  var WEB3FORMS_ACCESS_KEY = '908698fb-f399-4676-b8e0-084d37770c57';
  var CLINIC_WHATSAPP = '917017939778';
  var RECIPIENT_EMAIL = 'riyamalik2019@gmail.com';

  var form = document.getElementById('appointment-form');
  if (!form) return;

  var loading = form.querySelector('.loading');
  var errorMessage = form.querySelector('.error-message');
  var sentMessage = form.querySelector('.sent-message');

  function setMessageVisible(el, visible) {
    if (!el) return;
    el.classList.toggle('d-block', visible);
  }

  function showLoading(show) {
    setMessageVisible(loading, show);
    if (show) {
      setMessageVisible(errorMessage, false);
      setMessageVisible(sentMessage, false);
    }
  }

  function showError(msg) {
    setMessageVisible(loading, false);
    setMessageVisible(sentMessage, false);
    if (errorMessage) {
      errorMessage.innerHTML = msg;
      setMessageVisible(errorMessage, true);
    }
  }

  function showSuccess(html) {
    setMessageVisible(loading, false);
    setMessageVisible(errorMessage, false);
    if (sentMessage) {
      sentMessage.innerHTML = html;
      setMessageVisible(sentMessage, true);
    }
  }

  function hideMessages() {
    setMessageVisible(loading, false);
    setMessageVisible(errorMessage, false);
    setMessageVisible(sentMessage, false);
  }

  function getField(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function isValidIndianPhone(phone) {
    var digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.indexOf('91') === 0) {
      digits = digits.slice(2);
    }
    if (digits.length !== 10) {
      return false;
    }
    return /^[6-9]\d{9}$/.test(digits);
  }

  function validatePhoneField() {
    var phone = getField('phone');
    var phoneInput = form.querySelector('[name="phone"]');
    if (!isValidIndianPhone(phone)) {
      showError(
        'Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9). Optional prefix: +91.'
      );
      if (phoneInput) {
        phoneInput.focus();
        phoneInput.setCustomValidity(
          'Enter a valid 10-digit mobile number (e.g. 9876543210).'
        );
        phoneInput.reportValidity();
      }
      return false;
    }
    if (phoneInput) {
      phoneInput.setCustomValidity('');
    }
    return true;
  }

  function buildWhatsAppUrl() {
    var text =
      '*New Appointment Request*\n\n' +
      'Name: ' + getField('name') + '\n' +
      'Email: ' + getField('email') + '\n' +
      'Contact Number: ' + getField('phone') + '\n' +
      'Subject: ' + getField('subject') + '\n\n' +
      'Message:\n' + getField('message');
    return 'https://wa.me/' + CLINIC_WHATSAPP + '?text=' + encodeURIComponent(text);
  }

  function buildMailtoUrl() {
    var subject = 'Appointment: ' + getField('subject');
    var body =
      'Name: ' + getField('name') + '\n' +
      'Email: ' + getField('email') + '\n' +
      'Contact Number: ' + getField('phone') + '\n\n' +
      getField('message');
    return (
      'mailto:' +
      RECIPIENT_EMAIL +
      '?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body)
    );
  }

  function openWhatsAppFallback() {
    window.open(buildWhatsAppUrl(), '_blank', 'noopener');
    showSuccess(
      'Online email could not be sent from your network. ' +
        '<strong>WhatsApp has been opened</strong> with your details — please tap Send there to complete your booking.'
    );
  }

  function isAccessKeyConfigured() {
    return (
      WEB3FORMS_ACCESS_KEY &&
      WEB3FORMS_ACCESS_KEY !== 'REPLACE_WITH_YOUR_ACCESS_KEY'
    );
  }

  var phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      phoneInput.setCustomValidity('');
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideMessages();

    if (!validatePhoneField()) {
      return;
    }

    showLoading(true);

    if (!isAccessKeyConfigured()) {
      showLoading(false);
      openWhatsAppFallback();
      return;
    }

    var payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      name: getField('name'),
      email: getField('email'),
      phone: getField('phone'),
      subject: 'Soulsync Appointment: ' + getField('subject'),
      message:
        'Contact Number: ' +
        getField('phone') +
        '\n\n' +
        getField('message'),
      from_name: getField('name'),
      replyto: getField('email')
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not send your message.');
          }
          return data;
        });
      })
      .then(function () {
        showSuccess(
          'Your message has been sent. We will get back to you shortly. Thank you!'
        );
        form.reset();
      })
      .catch(function () {
        showLoading(false);
        openWhatsAppFallback();
      });
  });

  if (new URLSearchParams(window.location.search).get('sent') === '1') {
    showSuccess(
      'Your message has been sent. We will get back to you shortly. Thank you!'
    );
    if (window.history.replaceState) {
      var cleanUrl = window.location.href.split('?')[0].split('#')[0] + '#contact';
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppointmentForm);
} else {
  initAppointmentForm();
}
