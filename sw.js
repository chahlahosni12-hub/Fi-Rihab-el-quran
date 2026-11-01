const CACHE_NAME = 'quran-app-v1';
const ASSETS_TO_CACHE = [
    './admin-recitations.html', // أو index.html حسب اسم ملف الواجهة الرئيسي لديك
    './style.css',
    './app.js'
];

// 1. تثبيت الـ Service Worker وحفظ الملفات الأساسية
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('جارٍ حفظ الملفات في الذاكرة المؤقتة (Cache)...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. تفعيل الـ Service Worker وحذف النسخ القديمة إن وجدت
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('حذف ذاكرة التخزين القديمة:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.claim();
});

// 3. اعتراض الطلبات (Fetch) لتشغيل التطبيق أوفلاين
self.addEventListener('fetch', event => {
    // نتجاوز طلبات Firebase و Firestore لأنها تتطلب اتصالاً حياً بقاعدة البيانات
    if (event.request.url.includes('firestore.googleapis.com') || 
        event.request.url.includes('firebaseapp.com') ||
        event.request.url.includes('googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // إذا وجدنا الملف مخزناً، نعيده، وإلا نجلبه من الشبكة
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).catch(() => {
                // يمكن هنا إرجاع صفحة بديلة (Fallback) في حال انقطاع النت تماماً
            });
        })
    );
});
