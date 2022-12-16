/**
 * Adds a new product to cart
 * 
 * @param {string} productId id of the product to be added
 * @param {string} productName name of the product to be added
 */
const addToCart = (productId, productName) => {
  // use addProductToCart(), available already from /public/js/utils.js
  addProductToCart(productId);
  // /public/js/utils.js also includes createNotification() function
  createNotification(`Added ${productName} to cart!`, 'notifications-container', true);
};

(async () => {
  // get the 'products-container' element
  const productContainer = document.getElementById('products-container');
  // get the 'product-template' element
  const productTemplate = document.getElementById('product-template');

  try {
    // use getJSON(url) to get the available products
    const products = await getJSON('/api/products');

    products.forEach(product => {
      // clone the template
      const templateClone = productTemplate.content.cloneNode(true);

      // add product information to the template clone
      const name = templateClone.querySelector('h3');
      const description = templateClone.querySelector('.product-description');
      const price = templateClone.querySelector('.product-price');
      const addToCartBtn = templateClone.querySelector('button');

      name.textContent = product.name;
      description.textContent = product.description;
      price.textContent = product.price;

      const id = product._id;
      name.setAttribute('id', `name-${id}`);
      description.setAttribute('id', `description-${id}`);
      price.setAttribute('id', `price-${id}`);
      addToCartBtn.setAttribute('id', `add-to-cart-${id}`);

      // add an event listener for the button's 'click' event,
      // and call addToCart() in the event listener's callback
      addToCartBtn.addEventListener('click', () => { addToCart(product._id, product.name); });

      // add the products to the the page
      productContainer.appendChild(templateClone);
    });
  } catch (error) {
    console.error(error);
    return createNotification('There was an error while fetching products', 'notifications-container', false);
  }

})();