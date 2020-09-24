import {select, settings, classNames, templates} from '../settings.js';
import {CartProduct} from './CartProduct.js';
import {utils} from '../utils.js';

export class Cart
{
  constructor(element)
  {
    const thisCart = this;

    //thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.products = [];

    thisCart.getElements(element);

    thisCart.initActions();

    //console.log('new Cart', thisCart);
  }

  getElements(element)
  {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  initActions()
  {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event)
    {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('update', function()
    {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event)
    {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event)
    {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  sendOrder()
  {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = 
    {
      adress: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      //totalProce: thisCart.totalPrice,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      totalPrice: thisCart.totalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let product in thisCart.products)
    {
      const data = thisCart.products[product].getData();
      payload.products.push(data);
    }

    const options = 
    {
      method: 'POST',
      headers:
      {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response)
      {
        return response.json();
      })
      .then(function(parseResponse)
      {
        console.log('parseResponse', parseResponse);
      });
  }

  add(menuProduct)
  {
    const thisCart = this;

    //console.log('adding product', menuProduct);

    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utils.createDOMFromHTML */
    thisCart.element = utils.createDOMFromHTML(generatedHTML);

    /* find CartProducts container */
    const generatedDOM = document.querySelector(select.containerOf.cartProducts);

    /* add element to menu */
    generatedDOM.appendChild(thisCart.element);

    //thisCart.products.push(menuProduct);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.dom.productList = generatedDOM;
    thisCart.dom.productList.addEventListener('update', function()
    {
      thisCart.update();
    });
    //console.log('thisCart.dom.productList: ', thisCart.dom.productList);

    //console.log('thisCart.products: ', thisCart.products);
    thisCart.update();
  }

  update()
  {
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let product of thisCart.products)
    {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }
    console.log('thisCart.totalNumber: ', thisCart.totalNumber);
    if(thisCart.totalNumber > 0)
    {
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    }
    else
    {
      thisCart.deliveryFee = 0;
    }

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    for(let element of thisCart.dom.totalPrice)
    {
      element.innerHTML = thisCart.totalPrice;
    }

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

    //console.log('thisCart.totalNumber: ', thisCart.totalNumber);
    //console.log('thisCart.subtotalPrice: ', thisCart.subtotalPrice);
    //console.log('thisCart.totalPrice: ', thisCart.totalPrice);
  }

  remove(cartProduct)
  {
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
}