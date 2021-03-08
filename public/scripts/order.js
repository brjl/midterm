
$(document).ready(function() {
  addHeadToCheckoutListener();
  onMenuClicked();
});

//GLOBAL VARS
let _menu = [];
let _cart = [];

//shows main menu
const onMenuClicked = () => {
  $('#menu_btn').on('click', () => {
  $('.fas-right').fadeIn('slow');
  $('#order-container').css('display', 'none');
  $('#order-container').html('');
  $("#item-container").fadeIn('slow');
  scrollIntoView();
});
}

//adds order item to cart
const addToCart = menu_id => {

  for (const item of _menu) {

    if (Number(menu_id) === Number(item.id))   {
     _cart.push(item);
     $('#added_to_cart').html(`${item.food_item} Added To Cart`);
     $('#added_to_cart').fadeIn('slow');
     setTimeout(function(){
     $('#added_to_cart').slideUp('slow');
     },1000);
     return $('#cart_size').html(`${_cart.length}`);
    }
  }
};

//adds a listener event to the headToCheckout function
const addHeadToCheckoutListener = () => {

  $('#head_to_checkout').on('click', () => {
    headToCheckout();
  });
};

//builds the checkout html element
const headToCheckout = () => {

  if(!_cart || _cart.length < 1) {
    $('#added_to_cart').html(`You have no items in your cart.`);
    $('#added_to_cart').fadeIn('slow');
    setTimeout(function(){
    $('#added_to_cart').slideUp('slow');
    },3000);
    return;
  }

  $('.fas-right').css('display','none');
  const orderElements = [];
  let totalPrice = 0;

  $orderDetails = `
  <div id='order-title'>
  <h1>${sessionStorage.getItem('username')}'s Order</h1>
  </div>
  `
  orderElements.push($orderDetails);

  for (const item of _cart) {

    let $orderDetails = `
    <section>
    <img src='${item.image_url}'/>
    <h3>${item.food_item}</h3>
    <h3>$${item.price}</h3>
    <button id=${item.id} onclick="removeFromCart(this.id)">remove item</button>
    </section>
    `
    orderElements.push($orderDetails);
    totalPrice += Number(item.price);
  }

    $orderDetails = `
    <div class='order-footer'>
    <h2>Order Total: $${totalPrice}</h2>
    <button id='place_order'>Place Order</button>
    </div>
    `
    orderElements.push($orderDetails);
    return renderCheckoutPage(orderElements);
};

//takes an html element as an args and renders the users checkout details
const renderCheckoutPage = order => {

  $('#item-container').css('display', 'none');
  $('#order-container').fadeIn('slow');

  for (const item of order){
    $("#order-container").append(item);
  }
  scrollIntoView();
  addPlaceOrderListener();
};

//removes an item from the users cart by fetching its ID and re-renders the order-container
const removeFromCart = (menu_id) => {

    for (let i = 0; i < _cart.length; i++) {

      if (Number(menu_id) === Number(_cart[i].id)) {

        _cart.splice(i, 1);
        $('#cart_size').html(`${_cart.length}`);
        $('#order-container').css('display', 'none');
        $('#order-container').html('');

        if (_cart.length < 1){
          $('.fas-right').fadeIn('slow');
          return $("#item-container").fadeIn('slow');
        } else {
          return headToCheckout();
        }
      }
    }

  };

//allows the current user to place an order
const addPlaceOrderListener = () => {

  $('#place_order').on('click', () => {

    const menu_ids = _cart.map(x => x = x.id);

    const orderData = {
      user: sessionStorage.getItem('pseudoUser'),
      menu_items: menu_ids,
    }

    $.ajax({
      url: '/api/place_orders',
      type: 'POST',
      data: orderData,

      success: data => {
        $("#complete-container").append(processingOrderAnimation);
        $("#complete-container").fadeIn('slow');
        $(".inner-complete-container").slideDown('slow');

        //test function for simulating SMS received update
        simulateSMS();

      },
      error: error => {
        console.log(error.responseText);
      },
    });

  });
};

//creates a spinner animation while the SMS functionality is handled
const processingOrderAnimation = () => {

  const $processing = `<section class='inner-complete-container'>
  <h2>Order Received</h2>
  <h4>Processing estimated wait time...</h4>
  <div class="sending"></div>
  </section>`;
  _cart = [];
  $('#cart_size').html(`${_cart.length}`);
  return $processing;
};

// updates the browser with estimated time into from the fetched order data and SMS update;
const createOrderPlacedElement = () => {

  const minutes = 30; //TEST VALUE ONLY

  const waitTime = Number(minutes) * 60 * 1000;
  const pickUpTime = new Date(new Date().getTime() + waitTime).toLocaleTimeString();

  const $orderMSg = `<section class='final-complete-container'>
  <a href='/'><h6>menu<h6></a>
  <h4>
  Your order will be ready in
  </h4>
  <p>
  ${minutes} minutes
  </p>
  <h4>
  Pick-Up Time
  </h4>
  <p>
  ${pickUpTime}
  <p>
  <a href='https://www.google.com/maps2/dir/?api=1&origin=&destination=Stanley+Park+Vancouver+BC&travelmode=bicycling' target='_blank'><img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2aQejmdcLqj9jgx9LMaOwaAM0YDZpAkMohg&usqp=CAU'/></a>
  </section>`;

  return $orderMSg;
};


//scrolls the menu and checkout containers into view
const scrollIntoView = () => {

  $('.anchor').slideDown('slow');

  $('html, body').animate({
    scrollTop: $(".anchor").offset().top

   }, 1000);


   $(window).scroll( () => {

    let scroll = $(window).scrollTop();

    if (scroll < 1) {
      $('.anchor').slideUp('slow');
    }

  });



}


//fetches the users recently placed order by order_id.
const fetchOrderDetails = id => {

  const url = `/api/fetch_orders/${id}`;

  $.ajax({
    url: url,
    type: 'GET',

    success: data => {
      console.log(data);

    },
    error: error => {
      console.log(error.responseText);
    },
  });

};


//test function for simulating SMS received from restaurant
const simulateSMS = () => {

  setTimeout(function(){

    $(".inner-complete-container").fadeOut('slow');
    $("#complete-container").append(createOrderPlacedElement);

    setTimeout(function(){
      $(".final-complete-container").fadeIn('slow');
    },1000);

    },5000);
}

















