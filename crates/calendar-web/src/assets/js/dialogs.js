/* Dialog + toast helpers over the vendored SweetAlert2 (sweetalert2.all.min.js
 * bundles its own styles). confirmDialog/promptDialog keep the jQuery-promise
 * signatures every caller already uses: they resolve only on OK, never on
 * cancel/dismiss, so .done() chains stay no-op on cancel like before. */
(function () {
  'use strict';

  // Shared SweetAlert2 styling; window-exposed so other files (app.js's
  // series dialog) reuse the same button classes.
  var BUTTONS = {
    buttonsStyling: false,
    confirmButtonColor: undefined,
    customClass: {
      confirmButton: 'btn btn-primary',
      cancelButton: 'btn btn-secondary',
    },
    // ponytail: returnFocus off so a confirm opened from inside a Bootstrap
    // modal (attachment rows, discard-changes) doesn't fight Bootstrap's
    // focus restore when it closes.
    returnFocus: false,
    // ponytail: Bootstrap's focus trap yanks focus out of any SweetAlert
    // input opened over a modal (can't select/copy/type). Pause it while the
    // popup is open; _focustrap is private API, pinned by the vendored 5.3.3.
    didOpen: function () { setModalTraps('deactivate'); },
    willClose: function () { setModalTraps('activate'); },
  };

  function setModalTraps(action) {
    $('.modal.show').each(function () {
      var m = bootstrap.Modal.getInstance(this);
      if (m && m._focustrap) { m._focustrap[action](); }
    });
  }
  window.BUTTONS = BUTTONS;

  window.confirmDialog = function (message, options) {
    var d = $.Deferred();
    Swal.fire($.extend({
      title: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
    }, BUTTONS, options || {})).then(function (r) {
      if (r.isConfirmed) { d.resolve(true); }
    });
    return d.promise();
  };

  window.promptDialog = function (message, defaultValue) {
    var d = $.Deferred();
    Swal.fire($.extend({
      title: message,
      input: 'text',
      inputValue: defaultValue || '',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
    }, BUTTONS)).then(function (r) {
      if (r.isConfirmed) { d.resolve(r.value || ''); }
    });
    return d.promise();
  };

  window.errorDialog = function (message) {
    return Swal.fire($.extend({
      icon: 'error',
      title: message || 'Something went wrong',
    }, BUTTONS));
  };

  window.toast = function (message, icon) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: icon || 'success',
      title: message,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };
})();