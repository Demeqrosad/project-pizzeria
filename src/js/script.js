/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      });
    }

    processOrder()
    {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);

      /* fetch current price of thisProduct */
      let price = thisProduct.data.price;
      console.log('Current price: ', price);
      /* START LOOP: for each param */
      const params = dataSource.products[thisProduct.id].params;
      console.log('Params: ', params);
      for(let param in params)
      {
        /* START LOOP: for each option */
        const options = dataSource.products[thisProduct.id].params[param].options;
        console.log('Options of ' + param + ':', options);
        for(let option in options)
        {
          /* Check if option is checked*/
          const isDefault = dataSource.products[thisProduct.id].params[param].options[option].default;
          const optionPrice = dataSource.products[thisProduct.id].params[param].options[option].price;
          console.log('formData: ', formData[param]);
          if(formData.hasOwnProperty(param) && formData[param].indexOf(option) > -1)
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
        /* END LOOP: for each option */
        }
      /* END LOOP: for each param */
      }
      /* Update current price*/
      console.log('Final price: ', price);
      thisProduct.priceElem.innerHTML = price;
    }

  }

  const app = {
    initMenu: function()
    {
      const thisApp = this;

      console.log('thisApp.data: ', thisApp.data);

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

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
