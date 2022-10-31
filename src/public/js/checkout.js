const $form = $("#checkout-form");

$form.submit((event) => {
  $form.find("button").prop("disabled", true);
});
