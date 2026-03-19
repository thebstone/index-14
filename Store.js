// ================== تهيئة AOS ==================
AOS.init({
  duration: 1000,
  once: true,
  offset: 100,
  easing: 'ease-in-out'
});

// ================== متغيرات عامة ==================
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentProductForShare = null;

// ================== رسالة الترحيب ==================
function closeWelcomeMessage() {
  const welcomeMessage = document.getElementById('welcomeMessage');
  welcomeMessage.classList.add('hide');
  
  setTimeout(() => {
      welcomeMessage.style.display = 'none';
  }, 500);
  
  playSound('clickSound');
}

// إظهار رسالة الترحيب عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
      const welcomeMessage = document.getElementById('welcomeMessage');
      if (welcomeMessage) {
          welcomeMessage.style.display = 'flex';
      }
  }, 500);
  
  updateCartCount();
  updateFavoriteCount();
  setupEventListeners();
  setupSmoothScrolling();
  startCountdown();
  startRainEffect();
  updateOfferCountdown();
});

// ================== إعداد مستمعي الأحداث ==================
function setupEventListeners() {
  // أزرار إضافة للسلة
  document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', addToCart);
  });

  // أيقونة السلة
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
      cartIcon.addEventListener('click', toggleCart);
  }

  // إغلاق السلة
  const closeCart = document.querySelector('.close-cart');
  if (closeCart) {
      closeCart.addEventListener('click', toggleCart);
  }

  // الأوفرلاي
  const cartOverlay = document.querySelector('.cart-overlay');
  if (cartOverlay) {
      cartOverlay.addEventListener('click', toggleCart);
  }

  // أزرار الفلتر
  setupFilterButtons();

  // أيقونة المفضلة
  const favoriteIcon = document.querySelector('.favorite-icon');
  if (favoriteIcon) {
      favoriteIcon.addEventListener('click', toggleFavorites);
  }

  // زر "تسوق الآن"
  const shopNowBtn = document.querySelector('.shop-now-btn');
  if (shopNowBtn) {
      shopNowBtn.addEventListener('click', () => {
          window.location.href = '#collection';
      });
  }

  // زر "عرض الكل"
  const viewAllBtn = document.querySelector('.view-all-arrival');
  if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
          window.location.href = '#collection';
      });
  }

  // نموذج الاشتراك
  const subscribeForm = document.getElementById('subscribe-form');
  if (subscribeForm) {
      subscribeForm.addEventListener('submit', handleSubscribe);
  }

  // زر تبديل الوضع
  const themeSwitcher = document.getElementById('themeSwitcher');
  if (themeSwitcher) {
      themeSwitcher.addEventListener('click', toggleTheme);
  }

  // أزرار العرض السريع
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', quickView);
  });

  // زر مشاركة
  setupShareButtons();
}

// ================== وظائف السلة ==================
function addToCart(event) {
  event.stopPropagation();
  const productCard = event.target.closest('.product-card');
  
  const product = {
      id: productCard.dataset.id,
      name: productCard.dataset.name,
      price: parseInt(productCard.dataset.price),
      image: productCard.dataset.image,
      quantity: 1
  };

  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
      existingItem.quantity++;
  } else {
      cart.push(product);
  }

  updateCart();
  showNotification(`✅ تم إضافة ${product.name} إلى السلة`);
  animateCartCount();
  playSound('clickSound');
}

function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll('.cart-count, .cart-count-nav, .cart-count-header').forEach(el => {
      if (el) el.textContent = count;
  });
}

function renderCartItems() {
  const cartItemsContainer = document.querySelector('.cart-items');
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #aaa;">
              <i class="fa-solid fa-cart-shopping" style="font-size: 3rem; margin-bottom: 20px; color: #667eea;"></i>
              <p>سلة التسوق فارغة</p>
              <p style="font-size: 0.9rem; margin-top: 10px;">تصفح المنتجات وأضف ما يعجبك</p>
          </div>
      `;
  } else {
      cartItemsContainer.innerHTML = cart.map(item => `
          <div class="cart-item" data-id="${item.id}">
              <div class="cart-item-img">
                  <img src="${item.image}" alt="${item.name}">
              </div>
              <div class="cart-item-details">
                  <div class="cart-item-name">${item.name}</div>
                  <div class="cart-item-price">$${item.price}</div>
                  <div class="cart-item-quantity">
                      <button class="decrease-qty">-</button>
                      <span>${item.quantity}</span>
                      <button class="increase-qty">+</button>
                  </div>
              </div>
              <i class="fa-solid fa-trash-can remove-item"></i>
          </div>
      `).join('');

      cartItemsContainer.querySelectorAll('.decrease-qty').forEach(btn => {
          btn.addEventListener('click', decreaseQuantity);
      });

      cartItemsContainer.querySelectorAll('.increase-qty').forEach(btn => {
          btn.addEventListener('click', increaseQuantity);
      });

      cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
          btn.addEventListener('click', removeFromCart);
      });
  }

  updateCartTotal();
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalElement = document.querySelector('.total-amount');
  if (totalElement) {
      totalElement.textContent = `$${total}`;
  }
}

function decreaseQuantity(event) {
  event.stopPropagation();
  const cartItem = event.target.closest('.cart-item');
  const id = cartItem.dataset.id;
  const item = cart.find(i => i.id === id);
  
  if (item.quantity > 1) {
      item.quantity--;
  } else {
      cart = cart.filter(i => i.id !== id);
  }
  
  updateCart();
  playSound('clickSound');
}

function increaseQuantity(event) {
  event.stopPropagation();
  const cartItem = event.target.closest('.cart-item');
  const id = cartItem.dataset.id;
  const item = cart.find(i => i.id === id);
  item.quantity++;
  updateCart();
  playSound('clickSound');
}

function removeFromCart(event) {
  event.stopPropagation();
  const cartItem = event.target.closest('.cart-item');
  const id = cartItem.dataset.id;
  cart = cart.filter(item => item.id !== id);
  updateCart();
  showNotification('🗑️ تم حذف المنتج من السلة');
  playSound('clickSound');
}

function toggleCart() {
  document.querySelector('.cart-sidebar').classList.toggle('active');
  document.querySelector('.cart-overlay').classList.toggle('active');
  playSound('clickSound');
}

function animateCartCount() {
  const cartCount = document.querySelector('.cart-count-nav');
  if (cartCount) {
      cartCount.style.animation = 'pulse 0.3s ease';
      setTimeout(() => {
          cartCount.style.animation = '';
      }, 300);
  }
}

// ================== وظائف المفضلة ==================
function toggleFavorites() {
  showNotification('❤️ قريباً: صفحة المفضلة', 2000);
  playSound('clickSound');
}

function updateFavoriteCount() {
  document.querySelector('.favorite-count').textContent = favorites.length;
}

// ================== وظائف الفلتر ==================
function setupFilterButtons() {
  let col_btn = document.querySelectorAll(".btn-col");
  let col_item = document.querySelectorAll(".collection-item");

  col_btn.forEach((btn) => {
      btn.addEventListener("click", (e) => {
          col_btn.forEach((col_bt) => {
              col_bt.classList.remove("btn");
          });
          e.target.classList.add("btn");
          
          let data_btn = btn.getAttribute("data-btn");
          col_item.forEach((col) => {
              if (col.getAttribute("data-item") == data_btn || data_btn == "all") {
                  col.classList.remove("hide");
              } else {
                  col.classList.add("hide");
              }
          });
          playSound('clickSound');
      });
  });
}

// ================== قائمة التصفح للجوال ==================
let ul = document.querySelector("ul");
let burger_icon = document.querySelector(".burger_icon");

if (burger_icon) {
  burger_icon.addEventListener("click", () => {
      if (burger_icon.classList.contains("fa-bars")) {
          burger_icon.classList.add("fa-xmark");
          burger_icon.classList.remove("fa-bars");
          ul.classList.add("active");
      } else {
          burger_icon.classList.remove("fa-xmark");
          burger_icon.classList.add("fa-bars");
          ul.classList.remove("active");
      }
      playSound('clickSound');
  });
}

// ================== التمرير السلس ==================
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
              target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
              
              ul.classList.remove('active');
              if (burger_icon) {
                  burger_icon.classList.add("fa-bars");
                  burger_icon.classList.remove("fa-xmark");
              }
              
              document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-nav'));
              this.classList.add('active-nav');
              playSound('clickSound');
          }
      });
  });
}

// ================== تحديث الرابط النشط عند التمرير ==================
window.addEventListener('scroll', () => {
  let current = '';
  const sections = document.querySelectorAll('section, main');
  
  sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= (sectionTop - 200)) {
          current = section.getAttribute('id');
      }
  });

  document.querySelectorAll('nav a').forEach(a => {
      a.classList.remove('active-nav');
      if (a.getAttribute('href') === `#${current}`) {
          a.classList.add('active-nav');
      }
  });
});

// ================== زر العودة للأعلى ==================
const backToTopBtn = document.createElement('div');
backToTopBtn.className = 'back-to-top';
backToTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
      backToTopBtn.classList.add('show');
  } else {
      backToTopBtn.classList.remove('show');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
  playSound('clickSound');
});

// ================== نموذج الاشتراك ==================
function handleSubscribe(e) {
  e.preventDefault();
  const email = e.target.querySelector('.email').value;
  showNotification(`📧 تم الاشتراك بنجاح: ${email}`);
  e.target.reset();
  playSound('clickSound');
}

// ================== الإشعارات ==================
function showNotification(message, duration = 3000) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
      notification.remove();
  }, duration);
}

// ================== مؤثرات صوتية ==================
function playSound(soundId) {
  const sound = document.getElementById(soundId);
  if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('صوت غير متاح'));
  }
}

// ================== تبديل الوضع ==================
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const icon = document.querySelector('#themeSwitcher i');
  
  if (document.body.classList.contains('light-mode')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      showNotification('☀️ تم تفعيل الوضع النهاري');
  } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      showNotification('🌙 تم تفعيل الوضع الليلي');
  }
  
  playSound('clickSound');
}

// ================== العرض السريع ==================
function quickView(event) {
  event.stopPropagation();
  const productCard = event.target.closest('.product-card');
  const productName = productCard.dataset.name;
  const productPrice = productCard.dataset.price;
  
  showNotification(`🔍 ${productName} - $${productPrice}`);
  playSound('clickSound');
}

// ================== عداد التنازلي الرئيسي ==================
function startCountdown() {
  const targetDate = new Date();
  targetDate.setHours(23, 59, 59);
  
  function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;
      
      if (diff <= 0) {
          targetDate.setDate(targetDate.getDate() + 1);
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      document.getElementById('days').textContent = days.toString().padStart(2, '0');
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
      document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
      document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ================== عداد العرض الخاص ==================
function updateOfferCountdown() {
  const offerCountdown = document.getElementById('offerCountdown');
  if (!offerCountdown) return;
  
  let minutes = 5;
  let seconds = 23;
  let seconds2 = 45;
  
  setInterval(() => {
      offerCountdown.textContent = `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')} : ${seconds2.toString().padStart(2, '0')}`;
      
      seconds2--;
      if (seconds2 < 0) {
          seconds2 = 59;
          seconds--;
          if (seconds < 0) {
              seconds = 59;
              minutes--;
              if (minutes < 0) {
                  minutes = 5;
              }
          }
      }
  }, 1000);
}

// ================== تأثير المطر ==================
function startRainEffect() {
  const rainEffect = document.getElementById('rainEffect');
  
  setInterval(() => {
      if (Math.random() > 0.7) {
          rainEffect.classList.add('active');
          
          const interval = setInterval(() => {
              const drop = document.createElement('div');
              drop.classList.add('rain-drop');
              
              drop.style.left = Math.random() * 100 + '%';
              drop.style.animationDuration = Math.random() * 2 + 1 + 's';
              drop.style.opacity = Math.random();
              
              rainEffect.appendChild(drop);
              
              setTimeout(() => {
                  drop.remove();
              }, 3000);
          }, 50);
          
          setTimeout(() => {
              rainEffect.classList.remove('active');
              clearInterval(interval);
              rainEffect.innerHTML = '';
          }, 10000);
      }
  }, 30000);
}

// ================== عدسة مكبرة ==================
const magnifier = document.getElementById('magnifier');
const magnifierGlass = magnifier.querySelector('.magnifier-glass');

document.querySelectorAll('.product-card figure img').forEach(img => {
  img.addEventListener('mousemove', (e) => {
      magnifier.classList.add('active');
      
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      magnifier.style.left = e.clientX - 125 + 'px';
      magnifier.style.top = e.clientY - 125 + 'px';
      
      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;
      
      magnifierGlass.style.backgroundImage = `url(${img.src})`;
      magnifierGlass.style.backgroundPosition = `${bgX}% ${bgY}%`;
      magnifierGlass.style.backgroundSize = '300% 300%';
  });
  
  img.addEventListener('mouseleave', () => {
      magnifier.classList.remove('active');
  });
});

// ================== أزرار المشاركة ==================
function setupShareButtons() {
  const shareModal = document.getElementById('shareModal');
  const closeShare = document.querySelector('.close-share');
  
  // إضافة زر المشاركة لكل منتج
  document.querySelectorAll('.product-card').forEach(card => {
      const shareBtn = document.createElement('button');
      shareBtn.classList.add('share-btn');
      shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
      shareBtn.style.cssText = `
          position: absolute;
          top: 20px;
          right: 20px;
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
          opacity: 0;
          transform: scale(0.8);
      `;
      
      card.addEventListener('mouseenter', () => {
          shareBtn.style.opacity = '1';
          shareBtn.style.transform = 'scale(1)';
      });
      
      card.addEventListener('mouseleave', () => {
          shareBtn.style.opacity = '0';
          shareBtn.style.transform = 'scale(0.8)';
      });
      
      shareBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentProductForShare = {
              id: card.dataset.id,
              name: card.dataset.name,
              price: card.dataset.price,
              image: card.dataset.image
          };
          
          document.getElementById('shareProductImage').src = currentProductForShare.image;
          document.getElementById('shareProductName').textContent = currentProductForShare.name;
          document.getElementById('shareProductPrice').textContent = '$' + currentProductForShare.price;
          
          shareModal.classList.add('active');
          playSound('clickSound');
      });
      
      card.appendChild(shareBtn);
  });
  
  if (closeShare) {
      closeShare.addEventListener('click', () => {
          shareModal.classList.remove('active');
      });
  }
  
  shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
          shareModal.classList.remove('active');
      }
  });
  
  // روابط المشاركة
  document.getElementById('shareFacebook')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentProductForShare) {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
      }
  });
  
  document.getElementById('shareTwitter')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentProductForShare) {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('تسوق ' + currentProductForShare.name)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
      }
  });
  
  document.getElementById('shareWhatsapp')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentProductForShare) {
          window.open(`https://wa.me/?text=${encodeURIComponent(currentProductForShare.name + ' ' + window.location.href)}`, '_blank');
      }
  });
  
  document.getElementById('shareTelegram')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentProductForShare) {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(currentProductForShare.name)}`, '_blank');
      }
  });
  
  document.getElementById('copyLink')?.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
          showNotification('🔗 تم نسخ الرابط');
          playSound('clickSound');
      });
  });
}

// ================== تأثيرات إضافية ==================
// تأثير حركة الماوس على الصور
document.addEventListener('mousemove', (e) => {
  const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
  const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
  
  document.querySelectorAll('.hero .col-img').forEach(el => {
      el.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
  });
});

// تأثير بريق عشوائي
setInterval(() => {
  const randomCard = document.querySelectorAll('.product-card')[Math.floor(Math.random() * document.querySelectorAll('.product-card').length)];
  
  if (randomCard) {
      const glitter = document.createElement('div');
      glitter.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 70%);
          animation: shine 2s ease;
          pointer-events: none;
          z-index: 5;
      `;
      
      randomCard.style.position = 'relative';
      randomCard.appendChild(glitter);
      
      setTimeout(() => {
          glitter.remove();
      }, 2000);
  }
}, 5000);

// ================== إضافة CSS إضافية ==================
const style = document.createElement('style');
style.innerHTML = `
  .back-to-top {
      position: fixed;
      bottom: 180px;
      right: 30px;
      width: 55px;
      height: 55px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
  }
  
  .back-to-top.show {
      opacity: 1;
      visibility: visible;
  }
  
  .back-to-top:hover {
      transform: translateY(-5px) scale(1.1);
  }
  
  .back-to-top i {
      color: white;
      font-size: 1.5rem;
  }
  
  .notification {
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 15px 30px;
      border-radius: 50px;
      z-index: 10001;
      animation: slideInRight 0.3s ease;
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
      font-weight: 500;
  }
  
  .cart-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      margin-bottom: 15px;
      position: relative;
      animation: slideInRight 0.3s ease;
  }
  
  .cart-item-img {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
  }
  
  .cart-item-img img {
      width: 100%;
      height: 100%;
      object-fit: contain;
  }
  
  .cart-item-details {
      flex: 1;
  }
  
  .cart-item-name {
      color: white;
      font-weight: 600;
      margin-bottom: 5px;
  }
  
  .cart-item-price {
      color: #667eea;
      font-weight: bold;
      margin-bottom: 5px;
  }
  
  .cart-item-quantity {
      display: flex;
      align-items: center;
      gap: 10px;
  }
  
  .cart-item-quantity button {
      width: 25px;
      height: 25px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 5px;
      color: white;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
  }
  
  .cart-item-quantity button:hover {
      transform: scale(1.1);
  }
  
  .cart-item-quantity span {
      color: white;
      min-width: 30px;
      text-align: center;
  }
  
  .remove-item {
      position: absolute;
      top: 5px;
      right: 5px;
      color: #ff6b6b;
      cursor: pointer;
      transition: all 0.3s ease;
  }
  
  .remove-item:hover {
      transform: scale(1.2);
      color: #ff4444;
  }
  
  @keyframes slideInRight {
      from {
          transform: translateX(100px);
          opacity: 0;
      }
      to {
          transform: translateX(0);
          opacity: 1;
      }
  }
  
  .share-btn {
      transition: all 0.3s ease;
  }
  
  .share-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
  
  body.light-mode .cart-item-name {
      color: #333;
  }
  
  body.light-mode .cart-item {
      background: #f5f5f5;
  }
  
  body.light-mode .brand-item {
      background: #ffffff;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  body.light-mode .brand-item:hover {
      background: linear-gradient(135deg, #667eea10, #764ba210);
  }
`;
document.head.appendChild(style);