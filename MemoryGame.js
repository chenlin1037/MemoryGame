import Timer from "./util.js";

// 游戏符号/图标数组，每个符号出现两次以创建配对
// const symbols = [
//     'cat', 'cat',
//     'dog', 'dog',
//     'fish', 'fish',
//     'paw', 'paw',
//     'horse', 'horse',
//     'frog', 'frog',
//     'spider', 'spider',
//     'dove', 'dove'
// ];

const symbols = [
  "🐱",
  "🐱", // 猫
  "🐶",
  "🐶", // 狗
  "🐠",
  "🐠", // 鱼
  "🐸",
  "🐸", // 青蛙
  "🦋",
  "🦋", // 蝴蝶
  "🐘",
  "🐘", // 大象
  "🦉",
  "🦉", // 猫头鹰
  "🐼",
  "🐼", // 熊猫
];

// 延迟时间（毫秒）
const DELAY = 800;

// 游戏卡片总数的一半（匹配对数）
const GAME_CARDS_QTY = symbols.length / 2;

// 星级评分的阈值
const RANK_3_STARS = GAME_CARDS_QTY + 2; // 三星评分最大移动次数
const RANK_2_STARS = GAME_CARDS_QTY + 6; // 二星评分最大移动次数
const RANK_1_STARS = GAME_CARDS_QTY + 10; // 一星评分最大移动次数

class MemoryGame {
  constructor() {
    // 初始化游戏状态变量
    this.opened = []; // 已翻开的卡片
    this.match = 0; // 已匹配的卡片对数
    this.moves = 0; // 玩家移动次数

    // 获取DOM元素
    this.deck = document.querySelector(".deck");
    this.moveNumElement = document.querySelector(".moves");
    this.ratingStars = document.querySelectorAll(".stars i");
    this.restartButton = document.querySelector(".restart");
    this.totalTimeElement = document.getElementById("total-time");

    // 初始化事件监听器和游戏
    this.initEventListeners();
    this.initGame();
  }

  // 洗牌算法：随机打乱数组
  shuffle(array) {
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;

    while (currentIndex !== 0) {
      // 生成随机索引
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // 交换元素
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  // 初始化事件监听器
  initEventListeners() {
    // 卡片点击事件委托
    this.deck.addEventListener("click", (e) => {
      const card = e.target.closest(".card");

      // 忽略无效点击和已匹配/已打开的卡片
      if (
          !card ||
          card.classList.contains("match") ||
          card.classList.contains("open")
      )
        return;

      // 防止同时翻开超过两张卡片
      if (document.querySelectorAll(".show").length > 1) return;

      this.flipCard(card);
    });

    // 重新开始按钮事件
    this.restartButton.addEventListener("click", () =>
        this.showRestartConfirmation(),
    );
  }

  // 初始化游戏：重置状态、洗牌卡片、创建卡片DOM
  initGame() {
    const cards = this.shuffle(symbols);

    // 清空卡片区域
    this.deck.innerHTML = "";

    // 重置游戏状态
    this.match = 0;
    this.moves = 0;

    // 重置移动次数和星级
    this.moveNumElement.textContent = this.moves;
    this.ratingStars.forEach((star) => {
      star.classList.remove("fa-star-o");
      star.classList.add("fa-star");
    });

    // 创建卡片元素
    cards.forEach((symbol) => {
      const cardElement = document.createElement("li");
      cardElement.classList.add("card");
      // cardElement.innerHTML = `<i class="fa fa-${symbol}"></i>`;
      cardElement.innerHTML = `<span class="emoji">${symbol}</span>`;
      this.deck.appendChild(cardElement);
    });

    this.totalTime = new Timer(this.totalTimeElement);
    this.totalTime.start();
  }

  // 翻牌逻辑
  flipCard(cardElement) {
    // 标记卡片为打开状态
    cardElement.classList.add("open", "show");
    this.opened.push(cardElement.innerHTML);

    // 检查是否有两张卡片已翻开
    if (this.opened.length > 1) {
      this.moves++;
      this.updateMoves();

      // 判断是否匹配
      if (this.opened[0] === this.opened[1]) {
        this.handleMatch();
      } else {
        this.handleNoMatch();
      }

      // 重置已翻开卡片
      this.opened = [];
    }
  }

  // 处理匹配成功的卡片
  handleMatch() {
    const openCards = document.querySelectorAll(".open");

    // 添加匹配和动画效果
    openCards.forEach((card) => {
      card.classList.add("match", "animated", "infinite", "rubberBand");
    });

    // 增加匹配对数
    this.match++;

    // 延迟后移除动画
    setTimeout(() => {
      openCards.forEach((card) => {
        card.classList.remove(
            "open",
            "show",
            "animated",
            "infinite",
            "rubberBand",
        );
      });
    }, DELAY);

    // 检查是否所有卡片都已匹配
    if (this.match === GAME_CARDS_QTY) {
      setTimeout(() => this.endGame(), 500);
    }
  }

  // 处理未匹配的卡片
  handleNoMatch() {
    const openCards = document.querySelectorAll(".open");

    // 添加未匹配动画效果
    openCards.forEach((card) => {
      card.classList.add("notmatch", "animated", "infinite", "wobble");
    });

    // 移除动画效果
    setTimeout(() => {
      openCards.forEach((card) => {
        card.classList.remove("animated", "infinite", "wobble");
      });
    }, DELAY / 1.5);

    // 隐藏卡片
    setTimeout(() => {
      openCards.forEach((card) => {
        card.classList.remove(
            "open",
            "show",
            "notmatch",
            "animated",
            "infinite",
            "wobble",
        );
      });
    }, DELAY);
  }

  // 更新移动次数和星级
  updateMoves() {
    this.moveNumElement.textContent = this.moves;
    this.setRating();
  }

  // 根据移动次数设置游戏星级
  setRating() {
    let rating = 3;

    if (this.moves >= RANK_3_STARS && this.moves < RANK_2_STARS) {
      this.ratingStars[2].classList.remove("fa-star");
      this.ratingStars[2].classList.add("fa-star-o");
      rating = 2;
    } else if (this.moves >= RANK_2_STARS && this.moves < RANK_1_STARS) {
      this.ratingStars[1].classList.remove("fa-star");
      this.ratingStars[1].classList.add("fa-star-o");
      rating = 1;
    } else if (this.moves >= RANK_1_STARS) {
      this.ratingStars[0].classList.remove("fa-star");
      this.ratingStars[0].classList.add("fa-star-o");
      rating = 0;
    }

    return rating;
  }

  // 显示重新开始确认对话框
  showRestartConfirmation() {
    if (confirm("确定要重新开始吗？你的进度将会丢失！")) {
      this.totalTime.stop();
      this.initGame();
    }
  }

  // 游戏结束处理
  endGame() {
    this.totalTime.stop();
    const score = this.setRating();

    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: {y: 0.6},
        colors: ["#ff5acd", "#fbda61", "#4158d0"],
      });
    }, 1000);

    // 显示胜利消息
    alert(
        `恭喜你赢了！\n总移动次数：${this.moves} 星级评分：${score} 颗星\n太棒了！`,
    );

    // 重新初始化游戏
    this.initGame();
  }
}

// 在DOM加载完成后初始化游戏
document.addEventListener("DOMContentLoaded", () => {
  new MemoryGame();
});
