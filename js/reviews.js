/* ============================================================
   BUY ALCHIMIA — Reviews Module
   Handles customer review submission and display.
   ============================================================ */

const Reviews = {
  /* Render review stars (0–5) */
  stars(rating, size = "1rem") {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = `<span style="color:var(--gold);font-size:${size};letter-spacing:2px;">`;
    html += "★".repeat(full);
    html += half ? "½" : "";
    html += `<span style="opacity:.35;">${"★".repeat(empty)}</span>`;
    html += "</span>";
    return html;
  },

  /* Render a full reviews section for a product page */
  renderSection(productId, productName, containerEl) {
    // Support legacy 2-arg call: renderSection(id, el)
    if (typeof productName === 'object' && productName !== null) {
      containerEl = productName;
      productName = productId;
    }
    if (!containerEl) return;
    const all     = (typeof DB !== "undefined") ? DB.reviews.getByProduct(productId) : [];

    const avg     = all.length ? (all.reduce((s, r) => s + r.rating, 0) / all.length) : 0;
    const totalCount = all.length;

    const breakdown = [5,4,3,2,1].map(star => {
      const count = all.filter(r => r.rating === star).length;
      const pct   = totalCount ? Math.round((count / totalCount) * 100) : 0;
      return { star, count, pct };
    });

    containerEl.innerHTML = `
      <div class="reviews-wrap">
        <div class="reviews-summary">
          <div class="reviews-avg">
            <div class="reviews-big-score">${avg.toFixed(1)}</div>
            <div>${Reviews.stars(avg, "1.2rem")}</div>
            <div class="reviews-count-label">${totalCount} review${totalCount !== 1 ? "s" : ""}</div>
          </div>
          <div class="reviews-breakdown">
            ${breakdown.map(b => `
              <div class="reviews-bar-row">
                <span class="reviews-bar-label">${b.star}★</span>
                <div class="reviews-bar-track"><div class="reviews-bar-fill" style="width:${b.pct}%"></div></div>
                <span class="reviews-bar-count">${b.count}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="reviews-list" id="reviews-list-${productId}">
          ${all.length === 0
            ? `<p style="color:#9b9385;padding:20px 0;">No reviews yet — be the first!</p>`
            : all.map(r => Reviews._cardHTML(r)).join("")
          }
        </div>

        <div class="reviews-form-wrap">
          <h4>Write a Review</h4>
          <form class="reviews-form" id="review-form-${productId}">
            <div class="reviews-star-pick" id="star-pick-${productId}">
              ${[1,2,3,4,5].map(s => `<button type="button" class="star-pick-btn" data-val="${s}" title="${s} star${s>1?"s":""}">★</button>`).join("")}
            </div>
            <input type="hidden" id="review-rating-${productId}" value="0">
            <div class="field">
              <label>Your Name</label>
              <input type="text" placeholder="Maria D." required id="review-name-${productId}">
            </div>
            <div class="field">
              <label>Review Title</label>
              <input type="text" placeholder="Great product!" required id="review-title-${productId}">
            </div>
            <div class="field">
              <label>Your Review</label>
              <textarea rows="4" placeholder="Tell others what you think..." required id="review-body-${productId}" style="width:100%;padding:.8rem 1rem;border:1px solid var(--paper-line);border-radius:var(--radius);font-family:var(--font-body);resize:vertical;background:var(--parchment);"></textarea>
            </div>
            <button type="submit" class="btn-primary">Submit Review</button>
          </form>
        </div>
      </div>
    `;

    // Star picker logic
    const starPick = containerEl.querySelector(`#star-pick-${productId}`);
    const ratingInput = containerEl.querySelector(`#review-rating-${productId}`);
    if (starPick) {
      const btns = starPick.querySelectorAll(".star-pick-btn");
      btns.forEach(btn => {
        btn.addEventListener("click", () => {
          const val = parseInt(btn.dataset.val);
          ratingInput.value = val;
          btns.forEach((b, i) => b.classList.toggle("active", i < val));
        });
        btn.addEventListener("mouseenter", () => {
          const val = parseInt(btn.dataset.val);
          btns.forEach((b, i) => b.classList.toggle("hover", i < val));
        });
        btn.addEventListener("mouseleave", () => {
          btns.forEach(b => b.classList.remove("hover"));
        });
      });
    }

    // Form submission
    const form = containerEl.querySelector(`#review-form-${productId}`);
    if (form) {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const rating = parseInt(ratingInput.value);
        if (!rating) {
          showToast && showToast("Please select a star rating.");
          return;
        }
        const productData = typeof DB !== "undefined" ? DB.products.getById(productId) : null;
        const review = {
          productId,
          productName: productData ? productData.name : productId,
          author: document.getElementById(`review-name-${productId}`).value.trim(),
          title:  document.getElementById(`review-title-${productId}`).value.trim(),
          body:   document.getElementById(`review-body-${productId}`).value.trim(),
          rating,
          country: "",
        };
        if (typeof DB !== "undefined") DB.reviews.add(review);
        form.reset();
        ratingInput.value = 0;
        containerEl.querySelectorAll(".star-pick-btn").forEach(b => b.classList.remove("active", "hover"));
        showToast && showToast("Thank you! Your review is pending approval. 🌿");
      });
    }
  },

  _cardHTML(r) {
    return `
      <div class="review-card">
        <div class="review-card-header">
          <div class="review-avatar">${(r.author || "A").charAt(0).toUpperCase()}</div>
          <div>
            <div class="review-author">${r.author}</div>
            <div class="review-location">${r.country || "Verified Purchase"}</div>
          </div>
          <div style="margin-left:auto;text-align:right;">
            ${Reviews.stars(r.rating)}
            <div style="font-size:.72rem;color:#9b9385;margin-top:2px;">${new Date(r.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</div>
          </div>
        </div>
        <div class="review-title">${r.title || ""}</div>
        <div class="review-body">${r.body}</div>
      </div>
    `;
  },
};
