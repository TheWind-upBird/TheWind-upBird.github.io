// Keep the execution trace consistent with Python's `return` semantics.
// Once the simulated function returns an answer, no further loop steps may run.
(function () {
  document.addEventListener('click', (event) => {
    const nextButton = event.target.closest('#traceNext');
    if (nextButton) {
      // app.js updates the trace synchronously in the button's own click handler.
      // Run after that handler and stop future steps if a return was reached.
      setTimeout(() => {
        const message = document.getElementById('tm');
        const button = document.getElementById('traceNext');
        if (!message || !button) return;
        if (message.textContent.includes('因此返回')) {
          button.disabled = true;
          button.textContent = '函数已返回';
        }
      }, 0);
    }

    const resetButton = event.target.closest('#traceReset');
    if (resetButton) {
      setTimeout(() => {
        const button = document.getElementById('traceNext');
        if (!button) return;
        button.disabled = false;
        button.textContent = '运行一步 ▶';
      }, 0);
    }
  });
})();
