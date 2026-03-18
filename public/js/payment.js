document.addEventListener('DOMContentLoaded', function() {
  const paymentForm = document.getElementById('paymentForm');
  const amountBtns = document.querySelectorAll('.amount-btn');
  const amountInput = document.getElementById('amount');
  const mobileInput = document.getElementById('mobileNumber');
  const submitBtn = document.getElementById('submitBtn');

  let selectedAmount = null;

  // Amount button selection
  amountBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all buttons
      amountBtns.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Set hidden input value
      selectedAmount = this.getAttribute('data-amount');
      amountInput.value = selectedAmount;
      
      // Clear error
      document.getElementById('amountError').textContent = '';
    });
  });

  // Form submission
  paymentForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const mobileNumber = mobileInput.value.trim();
    const amount = selectedAmount;

    // Validation
    let hasError = false;
    
    if (!mobileNumber || mobileNumber.length !== 10 || !/^[0-9]{10}$/.test(mobileNumber)) {
      document.getElementById('mobileError').textContent = '❌ Enter valid 10-digit mobile number';
      hasError = true;
    } else {
      document.getElementById('mobileError').textContent = '';
    }

    if (!amount) {
      document.getElementById('amountError').textContent = '❌ Please select an amount';
      hasError = true;
    } else {
      document.getElementById('amountError').textContent = '';
    }

    if (hasError) return;

    // Show loading state
    submitBtn.disabled = true;
    document.getElementById('btnText').classList.add('hidden');
    document.getElementById('btnSpinner').classList.remove('hidden');
    document.getElementById('formError').classList.add('hidden');

    try {
      // Call backend to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: 'User',
          customerEmail: `user${mobileNumber}@payment.local`,
          customerPhone: mobileNumber,
          amount: parseFloat(amount),
          currency: 'INR'
        })
      });

      const data = await response.json();

      if (data.success && data.data.paymentSessionId) {
        // Initialize Cashfree checkout
        const cashfree = window.Cashfree({
          mode: 'production' // Change to 'sandbox' for testing
        });

        cashfree.checkout({
          paymentSessionId: data.data.paymentSessionId,
          redirectTarget: '_self'
        });
      } else {
        throw new Error(data.message || 'Failed to create order');
      }
    } catch (error) {
      document.getElementById('formError').textContent = '❌ ' + (error.message || 'Something went wrong. Please try again.');
      document.getElementById('formError').classList.remove('hidden');
      console.error('Error:', error);
      
      submitBtn.disabled = false;
      document.getElementById('btnText').classList.remove('hidden');
      document.getElementById('btnSpinner').classList.add('hidden');
    }
  });
});
