import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {Booking} from './components/Booking.js';
import {select, settings, classNames, templates} from './settings.js';

const app = {
  initMenu: function()
  {
    const thisApp = this;

    //console.log('thisApp.data: ', thisApp.data);

    for(let productData in thisApp.data.products)
    {
      //new Product(productData, thisApp.data.products[productData]);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function()
  {
    const thisApp = this;

    thisApp.data = {};//dataSource;
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse)
      {
        return rawResponse.json();
      })
      .then(function(parseResponse)
      {
        /* save parseResponse as thisApp.data.products */
        thisApp.data.products = parseResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });
  },

  initCart: function()
  {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    app.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event)
    {
      console.log('thisApp.cart: ', thisApp.cart);
      console.log('event.detail.product: ', event.detail.product);
      app.cart.add(event.detail.product);
    });
  },

  initPages: function()
  {
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    let pagesMatchingHash = [];
    if(window.location.hash.length > 2)
    {
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page)
      {
        return page.id == idFromHash;
      });
    }

    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    //thisApp.activatePage(thisApp.pages[0].id);

    for(let link of thisApp.navLinks)
    {
      link.addEventListener('click', function(event)
      {
        const clickedElement = this;
        event.preventDefault();

        /* TODO: get page id from href */
        const pageId = clickedElement.getAttribute('href').replace('#', '');
        /* TODO: activate page */
        thisApp.activatePage(pageId);
      });
    }
  },

  activatePage: function(pageId)
  {
    const thisApp = this;

    for(let link of thisApp.navLinks)
    {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for(let page of thisApp.pages)
    {
      page.classList.toggle(classNames.nav.active, page.getAttribute('id') == pageId);
    }

    window.location.hash = '#/' + pageId;
  },

  initBooking: function()
  {
    const thisApp = this;

    const bookingElem = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingElem);
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
    //thisApp.initMenu();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
  },
};

app.init();