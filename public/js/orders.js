(async () => {
  try {
    // get the 'order-container' element
    const orderContainer = document.getElementById('order-container');
    // use getJSON(url) to get the orders
    const orders = await getJSON('/api/orders');
    // get the 'order-template' template
    const orderTemplate = document.getElementById('order-template');
    //get the 'product-template' template
    const productTemplate = document.getElementById('product-template');
    orders.forEach(order => {
      // add customerId to the template
      const orderTemplateClone = orderTemplate.content.cloneNode(true);
      const customerId = orderTemplateClone.querySelector('.customer-id');
      customerId.innerText = order.customerId;

      // Select product row there multiple items in the order will be put
      const orderProductsRow = orderTemplateClone.querySelector('.product-row')

      order.items.forEach(item => {
        // add the product information to the template
        const productTemplateClone = productTemplate.content.cloneNode(true);
        const name = productTemplateClone.querySelector('.product-name');
        const price = productTemplateClone.querySelector('.product-price');
        const amount = productTemplateClone.querySelector('.product-amount');

        name.innerText = item.product.name;
        price.innerText = item.product.price;
        amount.innerText = item.quantity + 'x';
        // Add one product to the prodcts row
        orderProductsRow.append(productTemplateClone)
      });
      // append the modified order template to the order container
      orderContainer.append(orderTemplateClone);
    });
  } catch (error) {
    console.error(error);
    return createNotification('There was an error while fetching orders', 'notifications-container', false);
  }
})();
