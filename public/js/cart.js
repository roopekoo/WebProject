/**
 * Adds a new product to cart
 * 
 * @param {string} productId id of the product to be added
 */
const addToCart = productId => {
  // use addProductToCart(), available already from /public/js/utils.js
  addProductToCart(productId);
  // call updateProductAmount(productId) from this file
  updateProductAmount(productId);
};

/**
 * Decreases the amount of products in the cart
 * 
 * @param {string} productId id of the product to be removed
 */
const decreaseCount = productId => {
  // Decrease the amount of products in the cart
  const count = decreaseProductCount(productId);
  updateProductAmount(productId);
  // Remove product from cart if amount is 0
  if (count === 0) {
    removeElement('cart-container', "item-" + productId);
  }
};

/**
 * Updates the amount of the products
 * 
 * @param {string} productId id of the product to be updated
 */
const updateProductAmount = productId => {
  // - read the amount of products in the cart
  const count = getProductCountFromCart(productId);
  // - change the amount of products shown in the right element's innerText
  document.querySelector(`#amount-${productId}`).innerText = count + 'x';
};

/**
 * Places the order
 * 
 * @returns {*} in case of error, a notification of error message
 */
const placeOrder = async () => {
  let itemsArray = [];
  // Get all products from the cart, /public/js/utils.js provides
  // getAllProductsFromCart()
  const cartProducts = getAllProductsFromCart();

  // Cancel ordering if the cart is empty
  if (cartProducts.length === 0) return createNotification('The cart is empty!', 'notifications-container', false);

  try {
    // use getJSON(url) to get the available products
    const products = await getJSON('/api/products');

    // for each of the products in the cart remove them, /public/js/utils.js
    // provides removeElement(containerId, elementId)
    cartProducts.forEach(cartProduct => {
      const product = products.find(elem=>elem._id == cartProduct.name);
      const item = {product: product, quantity: cartProduct.amount};
      itemsArray.push(item);
      removeElement('cart-container', "item-" + cartProduct.name);
    });
    let items = {items: itemsArray};
    await postOrPutJSON('/api/orders', 'POST', items);

    // show the user a notification: /public/js/utils.js provides
    // createNotification = (message, containerId, isSuccess = true)
    createNotification('Successfully created an order!', 'notifications-container', true);
    clearCart();
  } catch (error) {
    console.error(error);
    return createNotification('There was an error creating an order', 'notifications-container', false);
  }

};

(async () => {
  try {
    // get the 'cart-container' element
    const cart = document.getElementById('cart-container');
    // use getJSON(url) to get the available products
    const products = await getJSON('/api/products');
    // get all products from cart
    const cartProducts = getAllProductsFromCart();
    // get the 'cart-item-template' template
    const itemTemplate = document.getElementById('cart-item-template');
    cartProducts.forEach(item => {
      // copy the item information to the template
      const id = item.name;

      const product = products.find(itm => itm._id === id);
      const productName = product.name;

      const templateClone = itemTemplate.content.cloneNode(true);
      const name = templateClone.querySelector('.product-name');
      const price = templateClone.querySelector('.product-price');
      const amount = templateClone.querySelector('.product-amount');
      const buttons = templateClone.querySelectorAll('.cart-minus-plus-button');
      const plusBtn = buttons[0];
      const minusBtn = buttons[1];

      name.innerText = productName;
      price.innerText = product.price;
      amount.innerText = item.amount + 'x';

      name.id = "name-" + id;
      price.id = "price-" + id;
      amount.id = "amount-" + id;
      plusBtn.id = "plus-" + id;
      minusBtn.id = "minus-" + id;
      templateClone.querySelector('.item-row').id = "item-" + id;

      // add event listeners for cart-minus-plus-button
      plusBtn.addEventListener('click', () => addToCart(id));
      minusBtn.addEventListener('click', () => decreaseCount(id));
      // append the modified cart item to the cart
      cart.append(templateClone);
    });
    document.getElementById('place-order-button').addEventListener('click', () => placeOrder());
  } catch (error) {
    console.error(error);
    return createNotification('There was an error while fetching products', 'notifications-container', false);
  }
})();
