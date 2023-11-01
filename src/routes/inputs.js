$('input').focusin(function() {
    $(this).parent().attr('class', 'input__group--active');
    $(this).css('outline-color', '#faf8f1');
  });
  
  $('input').focusout(function() {
    $(this).parent().attr('class', 'input__group');
    $(this).css('background', '#fff');
  });
  
  $('input[required]').focusin(function() {
    $(this).css('background', '#f5d8d8');
    $(this).css('outline-color', '#e3b5b5');
  });