// スクロールアニメーション
function revealOnScroll() {
    const reveals = document.querySelectorAll('.feature-card, .story-item, .producer-card, .origin-section');

    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;

        if (elementTop < windowHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// お知らせを取得（Vercel Functions経由）
async function fetchNews() {
    const url = '/api/news?limit=5';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('ニュースの取得に失敗しました');
        }

        const data = await response.json();
        renderNews(data.contents);
    } catch (error) {
        console.error('Error fetching news:', error);
        renderNewsError();
    }
}

// 日付をフォーマット（2025.01.15形式）
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// HTMLタグを除去してプレーンテキストに変換
function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// ニュースを表示（アコーディオン形式）
function renderNews(newsItems) {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    if (newsItems.length === 0) {
        newsList.innerHTML = '<p class="news-empty">現在お知らせはありません。</p>';
        return;
    }

    const initialCount = 3;
    const newsHTML = newsItems.map((item, index) => {
        const plainContent = stripHtml(item.content);
        const hiddenClass = index >= initialCount ? 'news-item-hidden' : '';

        return `
            <div class="news-item ${hiddenClass}">
                <div class="news-header">
                    <span class="news-date">${formatDate(item.date || item.publishedAt || item.createdAt)}</span>
                    <h3>${item.title}</h3>
                    <span class="news-toggle"></span>
                </div>
                <div class="news-detail">
                    <p>${plainContent}</p>
                </div>
            </div>
        `;
    }).join('');

    // もっと見るボタン（4件以上ある場合のみ表示）
    const moreButtonHTML = newsItems.length > initialCount
        ? '<button class="news-more-btn" id="news-more-btn">もっと見る</button>'
        : '';

    newsList.innerHTML = newsHTML + moreButtonHTML;

    // アコーディオンイベントを再設定
    initNewsAccordion();

    // もっと見るボタンのイベント
    const moreBtn = document.getElementById('news-more-btn');
    if (moreBtn) {
        moreBtn.addEventListener('click', () => {
            const hiddenItems = document.querySelectorAll('.news-item-hidden');
            hiddenItems.forEach(item => item.classList.remove('news-item-hidden'));
            moreBtn.style.display = 'none';
        });
    }
}

// エラー時の表示
function renderNewsError() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    newsList.innerHTML = '<p class="news-error">お知らせの読み込みに失敗しました。</p>';
}

// お知らせアコーディオンの初期化
function initNewsAccordion() {
    const newsHeaders = document.querySelectorAll('.news-header');
    newsHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const newsItem = header.parentElement;
            newsItem.classList.toggle('active');
        });
    });
}

// トピックスバナーを取得（最新1件 - newsから取得）
async function fetchTopics() {
    const url = '/api/news?limit=1';
    const topicsContent = document.querySelector('.topics-content');

    if (!topicsContent) return;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('トピックスの取得に失敗しました');
        }

        const data = await response.json();

        if (data.contents && data.contents.length > 0) {
            const latest = data.contents[0];
            topicsContent.textContent = latest.title;
        } else {
            topicsContent.textContent = '新着情報はありません';
        }
    } catch (error) {
        console.error('Error fetching topics:', error);
        topicsContent.textContent = '2026年春、販売開始予定';
    }
}

// 初期設定
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.feature-card, .story-item, .producer-card, .origin-section');
    reveals.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    revealOnScroll();
    fetchNews();
    fetchTopics();
});

window.addEventListener('scroll', revealOnScroll);
