/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
      cartProducts: '#productsInCart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
  // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
  // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
  };

  class Product
  {
    constructor(id, data)
    {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();


      console.log('new Product: ', thisProduct);
    }

    renderInMenu()
    {
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements()
    {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion()
    {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function()
      {
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        /* find all active products */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        /* START LOOP: for each active product */
        for(let activeProduct of activeProducts)
        {
          /* START: if the active product isn't the element of thisProduct */
          if(activeProduct != thisProduct.element)
          {
            /* remove class active for the active product */
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          /* END: if the active product isn't the element of thisProduct */
          }
        /* END LOOP: for each active product */
        }
      /* END: click event listener to trigger */
      });
    }

    initOrderForm()
    {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event)
      {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs)
      {
        input.addEventListener('change', function()
        {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event)
      {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    initAmountWidget()
    {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('update', function()
      {
        thisProduct.processOrder();
      });
    }

    processOrder()
    {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);
      thisProduct.params = {};
      /* fetch current price of thisProduct */
      let price = thisProduct.data.price;
      //console.log('Current price: ', price);
      /* START LOOP: for each param */
      const params = dataSource.products[thisProduct.id].params;
      //console.log('Params: ', params);
      for(let param in params)
      {
        /* START LOOP: for each option */
        const options = dataSource.products[thisProduct.id].params[param].options;
        //console.log('Options of ' + param + ':', options);
        for(let option in options)
        {
          /* Check if option is checked*/
          const isDefault = dataSource.products[thisProduct.id].params[param].options[option].default;
          const optionPrice = dataSource.products[thisProduct.id].params[param].options[option].price;
          //console.log('formData: ', formData[param]);
          const isChecked = (formData.hasOwnProperty(param) && formData[param].indexOf(option) > -1);
          if(isChecked)
          {
            /* Check if option is not default */
            if(!isDefault)
            {
              price = price + optionPrice;
            }
          }
          else
          {
            /* Check if not checked option is default */
            if(isDefault)
            {
              price = price - optionPrice;
            }
          }
          const images = thisProduct.imageWrapper.querySelectorAll('.' + param + '-' + option);
          //console.log('Images: ', images);
          if(isChecked)
          {
            if(!thisProduct.params[param])
            {
              thisProduct.params[param] = 
              {
                label: dataSource.products[thisProduct.id].params[param].label,
                options: {},
              };
            }
            thisProduct.params[param].options[option] = dataSource.products[thisProduct.id].params[param].options[option].label;
            for(let image of images)
            {
              image.classList.add(classNames.menuProduct.imageVisible);
            }
          }
          else
          {
            for(let image of images)
            {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        /* END LOOP: for each option */
        }
      /* END LOOP: for each param */
      }
      /* Update current price*/
      //console.log('Final price: ', price);
      /* Multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = thisProduct.price;
      console.log(thisProduct.params);
    }

    addToCart()
    {
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
      app.cart.add(thisProduct);
    }
  }

  class AmountWidget
  {
    constructor(element)
    {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.value);
      thisWidget.initActions();
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
    }

    getElements(element)
    {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value)
    {
      const thisWidget = this;

      const newValue = parseInt(value);
      const oldValue = parseInt(thisWidget.value);

      /* TODO Add validation */

      if(newValue != oldValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax)
      {  
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions()
    {
      const thisWidget = this;

      //const oldValue = parseInt(thisWidget.input.value);
      thisWidget.input.addEventListener('change', function()
      {
        const newValue = parseInt(thisWidget.input.value);
        thisWidget.setValue(newValue);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event)
      {
        event.preventDefault();
        const oldValue = parseInt(thisWidget.input.value);
        const newValue = oldValue - 1;
        thisWidget.setValue(newValue);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event)
      {
        event.preventDefault();
        const oldValue = parseInt(thisWidget.input.value);
        const newValue = oldValue + 1;
        thisWidget.setValue(newValue);
      });
    }

    announce()
    {
      const thisWidget = this;

      const event = new Event('update');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart
  {
    constructor(element)
    {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);

      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element)
    {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.productList = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    }

    initActions()
    {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event)
      {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct)
    {
      const thisCart = this;

      console.log('adding product', menuProduct);

      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);
      console.log('generatedHTML: ', generatedHTML);

      /* create element using utils.createDOMFromHTML */
      thisCart.element = utils.createDOMFromHTML(generatedHTML);
      console.log('thisCart.element: ', thisCart.element);

      /* find menu container */
      const generatedDOM = document.querySelector(select.containerOf.cartProducts);
      console.log('generatedDOM: ', generatedDOM);

      /* add element to menu */
      generatedDOM.appendChild(thisCart.element);
    }
  }

  const app = {
    initMenu: function()
    {
      const thisApp = this;

      //console.log('thisApp.data: ', thisApp.data);

      for(let productData in thisApp.data.products)
      {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function()
    {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function()
    {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function()
    {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
