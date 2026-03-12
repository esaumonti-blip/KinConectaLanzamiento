const TouristDashboardApp = (() => {
  const state = {
    touristId: "tourist_001", // TODO(AUTH): obtener desde sesión/JWT
    user: {
      id: "tourist_001",
      name: "Alejandro M.",
      activeTrips: 2,
    },
    nextTrip: {
      id: "trip_100",
      destination: "Oaxaca, México",
      title: "Ruta cultural y gastronómica",
      dates: "15 Oct - 20 Oct, 2026",
      status: "Confirmado",
      image:
        "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=1200&q=80",
      guide: {
        id: "guide_210",
        name: "María López",
        avatar: "https://i.pravatar.cc/100?u=guide_210",
      },
    },
    recommendedGuides: [],
    destinations: [],
    savedGuides: [],
  };

  const fallback = {
    recommendedGuides: [
      {
        id: "g_1",
        name: "Ana García",
        rating: 4.9,
        tags: ["Montaña", "Historia"],
        desc: "Especialista en rutas de senderismo y patrimonio en Hidalgo y Puebla.",
        priceMXN: 450,
        image:
          "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "g_2",
        name: "Carlos Ruiz",
        rating: 5,
        tags: ["Gastronomía"],
        desc: "Experto en mercados y cocina tradicional en Ciudad de México.",
        priceMXN: 520,
        image:
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "g_3",
        name: "Sofía Kim",
        rating: 4.8,
        tags: ["Arte", "Museos"],
        desc: "Historia del arte y recorridos por galerías y talleres locales.",
        priceMXN: 480,
        image:
          "https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    destinations: [
      {
        id: "d_1",
        title: "Oaxaca, México",
        subtitle: "Cultura y tradición",
        wide: false,
        image:
          "https://images.unsplash.com/photo-1531761535209-180857e963b9?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "d_2",
        title: "San Miguel de Allende, Gto.",
        subtitle: "Arquitectura y vida nocturna",
        wide: false,
        image:
          "https://images.unsplash.com/photo-1591009175999-95a754c1f6f2?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "d_3",
        title: "Riviera Maya, Q. Roo",
        subtitle: "Playas y cenotes",
        wide: true,
        image:
          "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    savedGuides: [
      { id: "sg_1", name: "Jorge L.", place: "CDMX, México", avatar: "https://i.pravatar.cc/100?u=sg_1" },
      { id: "sg_2", name: "Elena R.", place: "Guadalajara, Jal.", avatar: "https://i.pravatar.cc/100?u=sg_2" },
      { id: "sg_3", name: "David M.", place: "Monterrey, N.L.", avatar: "https://i.pravatar.cc/100?u=sg_3" },
    ],
  };

  const dom = {
    msgBadge: null,
    userName: null,
    btnLogout: null,
    searchInput: null,
    nextTripMedia: null,
    nextTripDestination: null,
    nextTripTitle: null,
    nextTripDates: null,
    nextTripStatus: null,
    nextTripGuideAvatar: null,
    nextTripGuideName: null,
    btnChatGuide: null,
    btnTripDetails: null,
    btnTripManage: null,
    recommendedGuides: null,
    destinationGrid: null,
    savedGuides: null,
    btnNewTrip: null,
    btnChat: null,
    btnViewAllGuides: null,
    btnSavedAll: null,
    btnExploreMore: null,
  };

  const formatMoneyMXN = (value) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(value);

  const unwrapItems = (response) => {
    const data = response?.data?.items || response?.data || [];
    return Array.isArray(data) ? data : [];
  };

  const normalizeId = (value, fallback = 0) => {
    const digits = String(value ?? "").match(/\d+/g);
    const parsed = Number(digits ? digits.join("") : value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const page = (items, query) => {
    const rows = Array.isArray(items) ? items : [];
    const current = Math.max(0, Number(query?.page || 0));
    const size = Math.max(1, Number(query?.size || rows.length || 1));
    return rows.slice(current * size, current * size + size);
  };

  const loadingMarkup = (label, compact = false) => `
    <div class="guide-loading ${compact ? "guide-loading--compact" : ""}" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  function renderLoadingState() {
    if (dom.nextTripMedia) {
      dom.nextTripMedia.style.backgroundImage = "";
      dom.nextTripMedia.innerHTML = loadingMarkup("Cargando próximo viaje...", true);
    }
    if (dom.nextTripDestination) dom.nextTripDestination.textContent = "Destino en proceso...";
    if (dom.nextTripTitle) dom.nextTripTitle.textContent = "Cargando detalles del viaje...";
    if (dom.nextTripDates) dom.nextTripDates.textContent = "Fechas en proceso...";
    if (dom.nextTripStatus) dom.nextTripStatus.textContent = "Cargando...";
    if (dom.nextTripGuideName) dom.nextTripGuideName.textContent = "Guía en proceso...";
    if (dom.recommendedGuides) {
      dom.recommendedGuides.innerHTML = loadingMarkup("Cargando guías recomendadas...");
    }
    if (dom.destinationGrid) {
      dom.destinationGrid.innerHTML = loadingMarkup("Cargando destinos populares...");
    }
    if (dom.savedGuides) {
      dom.savedGuides.innerHTML = loadingMarkup("Cargando guías guardadas...", true);
    }
  }

  function mapGuide(raw) {
    return {
      id: raw.id,
      name: raw.name || raw.fullName || "Guía",
      rating: Number(raw.rating || 0),
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      desc: raw.description || "Sin descripción.",
      priceMXN: Number(raw.priceMXN || raw.price || 0),
      image:
        raw.imageUrl ||
        raw.avatarUrl ||
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
    };
  }

  function mapDestination(raw) {
    return {
      id: raw.id,
      title: raw.title || raw.name || "Destino",
      subtitle: raw.subtitle || raw.description || "Sin descripción.",
      wide: Boolean(raw.wide || raw.isFeatured),
      image:
        raw.imageUrl ||
        "https://images.unsplash.com/photo-1531761535209-180857e963b9?auto=format&fit=crop&w=1200&q=80",
    };
  }

  function mapSavedGuide(raw) {
    return {
      id: raw.id,
      name: raw.name || raw.fullName || "Guía guardada",
      place: raw.place || raw.location || "México",
      avatar: raw.avatarUrl || "https://i.pravatar.cc/100?u=saved",
    };
  }

  async function hydrateFromApi() {
    const services = {
      user: window.KCUserService,
      profile: window.KCProfileService,
      review: window.KCReviewService,
      support: window.KCSupportService,
      tour: window.KCTourService,
      booking: window.KCBookingService,
    };

    const hasServices = Object.values(services).some(Boolean);
    if (!hasServices) {
      state.recommendedGuides = fallback.recommendedGuides.slice();
      state.destinations = fallback.destinations.slice();
      state.savedGuides = fallback.savedGuides.slice();
      return;
    }

    try {
      const touristId = normalizeId(state.touristId, 0);
      const [
        usersRes,
        guideProfilesRes,
        touristProfileRes,
        destinationsRes,
        reviewsRes,
        favoriteGuidesRes,
        bookingsRes,
        toursRes,
        tourDestinationsRes,
      ] = await Promise.all([
        services.user?.getUsers?.() ?? Promise.resolve(null),
        services.profile?.getGuideProfiles?.() ?? Promise.resolve(null),
        services.profile?.getTouristProfileById?.(touristId) ?? Promise.resolve(null),
        services.tour?.getDestinations?.() ?? Promise.resolve(null),
        services.review?.getReviews?.() ?? Promise.resolve(null),
        services.support?.getFavoriteGuides?.() ?? Promise.resolve(null),
        services.booking?.getBookings?.() ?? Promise.resolve(null),
        services.tour?.getTours?.() ?? Promise.resolve(null),
        services.tour?.getTourDestinations?.() ?? Promise.resolve(null),
      ]);

      const users = unwrapItems(usersRes);
      const guideProfiles = unwrapItems(guideProfilesRes);
      const touristProfile = touristProfileRes?.data || {};
      const destinations = unwrapItems(destinationsRes);
      const reviews = unwrapItems(reviewsRes);
      const favoriteGuides = unwrapItems(favoriteGuidesRes);
      const bookings = unwrapItems(bookingsRes);
      const tours = unwrapItems(toursRes);
      const tourDestinations = unwrapItems(tourDestinationsRes);

      const usersMap = new Map(users.map((item) => [normalizeId(item.userId, 0), item]));
      const guideProfilesMap = new Map(
        guideProfiles.map((item) => [normalizeId(item.userId, 0), item]),
      );
      const toursMap = new Map(tours.map((item) => [normalizeId(item.tourId, 0), item]));
      const destinationsMap = new Map(
        destinations.map((item) => [
          normalizeId(item.destinationId, 0),
          {
            title: `${item.city || ""}${item.state ? `, ${item.state}` : ""}`.trim() || "Destino",
            subtitle: item.description || "Destino disponible",
            imageUrl: item.imageUrl || "",
            wide: Boolean(item.isFeatured),
          },
        ]),
      );

      const ratingTotals = new Map();
      const ratingCounts = new Map();
      reviews.forEach((item) => {
        const guideId = normalizeId(item.guideId ?? item.userId ?? item.profileId, 0);
        const rating = Number(item.rating || 0);
        if (!guideId || !Number.isFinite(rating) || rating <= 0) return;
        ratingTotals.set(guideId, (ratingTotals.get(guideId) || 0) + rating);
        ratingCounts.set(guideId, (ratingCounts.get(guideId) || 0) + 1);
      });

      const ratingByGuide = new Map(
        [...ratingTotals.entries()].map(([guideId, total]) => [
          guideId,
          total / Math.max(1, ratingCounts.get(guideId) || 1),
        ]),
      );

      if (users.length || touristProfile) {
        const user = usersMap.get(touristId) || {};
        state.user.name = user.fullName || touristProfile.fullName || touristProfile.name || state.user.name;
        if (bookings.length) {
          state.user.activeTrips = bookings.filter((item) => {
            const matches = normalizeId(item.touristId, 0) === touristId;
            const status = String(item.status || "").toUpperCase();
            return matches && status !== "CANCELLED";
          }).length;
        }
      }

      if (bookings.length && tours.length) {
        const next = bookings
          .filter((item) => normalizeId(item.touristId, 0) === touristId)
          .slice()
          .sort((a, b) => String(a.startDatetime || "").localeCompare(String(b.startDatetime || "")))
          .find((item) => new Date(item.startDatetime) >= new Date()) || bookings[0] || null;
        if (next) {
          const tour = toursMap.get(normalizeId(next.tourId, 0)) || {};
          const guideUser = usersMap.get(normalizeId(next.guideId, 0)) || {};
          const guideProfile = guideProfilesMap.get(normalizeId(next.guideId, 0)) || {};
          state.nextTrip = {
            ...state.nextTrip,
            id: next.tripId ?? state.nextTrip.id,
            destination: guideProfile.locationLabel || tour.meetingPoint || state.nextTrip.destination,
            title: tour.title || state.nextTrip.title,
            dates: next.startDatetime && next.endDatetime
              ? `${new Date(next.startDatetime).toLocaleDateString("es-MX")} - ${new Date(next.endDatetime).toLocaleDateString("es-MX")}`
              : state.nextTrip.dates,
            status: next.status || state.nextTrip.status,
            image: tour.coverImageUrl || state.nextTrip.image,
            guide: {
              id: next.guideId || state.nextTrip.guide.id,
              name: guideUser.fullName || state.nextTrip.guide.name,
              avatar: guideProfile.avatarUrl || state.nextTrip.guide.avatar,
            },
          };
        }
      }

      if (guideProfiles.length) {
        const guideCards = guideProfiles.map((profile) => {
          const user = usersMap.get(normalizeId(profile.userId, 0)) || {};
          const rating = Number(profile.ratingAvg || ratingByGuide.get(normalizeId(profile.userId, 0)) || 0);
          return mapGuide({
            id: profile.userId,
            name: user.fullName || "Guia",
            fullName: user.fullName || "Guia",
            description: profile.summary || "Guia registrado en backend.",
            rating,
            priceMXN: Number(profile.hourlyRate || 0),
            imageUrl: profile.avatarUrl || "",
          });
        });

        state.recommendedGuides = guideCards.length
          ? page(guideCards, { page: 0, size: 6 })
          : fallback.recommendedGuides.slice();
      } else {
        state.recommendedGuides = fallback.recommendedGuides.slice();
      }

      if (destinations.length) {
        const items = page(
          destinations.map((item) => ({
            id: item.destinationId,
            title: `${item.city || ""}${item.state ? `, ${item.state}` : ""}`.trim() || "Destino",
            subtitle: item.description || "Destino disponible",
            wide: Boolean(item.isFeatured),
            imageUrl: item.imageUrl || "",
          })),
          { page: 0, size: 6 },
        );
        state.destinations = items.length ? items.map(mapDestination) : fallback.destinations.slice();
      } else {
        state.destinations = fallback.destinations.slice();
      }

      if (favoriteGuides.length && guideProfiles.length) {
        const saved = favoriteGuides
          .filter((item) => normalizeId(item.touristId, 0) === touristId)
          .map((item) => {
            const guideId = normalizeId(item.guideId ?? item.userId ?? item.favoriteGuideId, 0);
            const profile = guideProfilesMap.get(guideId) || {};
            const user = usersMap.get(guideId) || {};
            return mapSavedGuide({
              id: guideId || item.id,
              name: user.fullName || "Guia guardada",
              place: profile.locationLabel || "Mexico",
              avatarUrl: profile.avatarUrl || "",
            });
          })
          .filter((item) => item.id);
        state.savedGuides = saved.length ? page(saved, { page: 0, size: 6 }) : fallback.savedGuides.slice();
      } else {
        state.savedGuides = fallback.savedGuides.slice();
      }

      if (tourDestinations.length && destinationsMap.size && toursMap.size) {
        // If destinations are empty, enrich them using tour destinations as a fallback.
        if (!destinations.length) {
          const inferred = [];
          tourDestinations.forEach((link) => {
            const destination = destinationsMap.get(normalizeId(link.destinationId, 0));
            if (!destination) return;
            inferred.push({
              id: normalizeId(link.destinationId, 0),
              title: destination.title,
              subtitle: destination.subtitle,
              wide: destination.wide,
              imageUrl: destination.imageUrl,
            });
          });
          if (inferred.length) {
            state.destinations = page(inferred, { page: 0, size: 6 }).map(mapDestination);
          }
        }
      }
    } catch (error) {
      console.warn("Tourist dashboard API fallback enabled:", error);
      state.recommendedGuides = fallback.recommendedGuides.slice();
      state.destinations = fallback.destinations.slice();
      state.savedGuides = fallback.savedGuides.slice();
    }
  }

  function renderUser() {
    if (dom.userName) dom.userName.textContent = state.user.name;
    if (dom.msgBadge) {
      dom.msgBadge.textContent = String(state.user.activeTrips);
      dom.msgBadge.setAttribute("aria-label", `${state.user.activeTrips} viajes activos`);
    }
  }

  function renderNextTrip() {
    const trip = state.nextTrip;
    if (dom.nextTripMedia) {
      dom.nextTripMedia.innerHTML = '<div class="trip-card__media-overlay" aria-hidden="true"></div><div class="trip-card__media-badge"><span class="material-symbols-outlined" aria-hidden="true">location_on</span><span>Próximo destino</span></div><h3 class="trip-card__media-title" id="nextTripDestination"></h3>';
      dom.nextTripMedia.style.backgroundImage = `url('${trip.image}')`;
      dom.nextTripDestination = dom.nextTripMedia.querySelector("#nextTripDestination");
    }
    if (dom.nextTripDestination) dom.nextTripDestination.textContent = trip.destination;
    if (dom.nextTripTitle) dom.nextTripTitle.textContent = trip.title;
    if (dom.nextTripDates) dom.nextTripDates.textContent = trip.dates;
    if (dom.nextTripStatus) dom.nextTripStatus.textContent = trip.status;
    if (dom.nextTripGuideAvatar) dom.nextTripGuideAvatar.style.backgroundImage = `url('${trip.guide.avatar}')`;
    if (dom.nextTripGuideName) dom.nextTripGuideName.textContent = trip.guide.name;
  }

  function renderRecommendedGuides(list) {
    if (!dom.recommendedGuides) return;
    dom.recommendedGuides.innerHTML = "";

    list.forEach((guide) => {
      const card = document.createElement("article");
      card.className = "guide-card";
      card.innerHTML = `
        <div class="guide-card__media" style="background-image:url('${guide.image}');">
          <div class="guide-card__rating">
            <span class="material-symbols-outlined" aria-hidden="true">star</span>
            <span>${guide.rating.toFixed(1)}</span>
          </div>
          <div class="guide-card__tags">
            ${guide.tags.map((tag) => `<span class="guide-card__tag">${tag}</span>`).join("")}
          </div>
        </div>
        <div class="guide-card__body">
          <h3 class="guide-card__name">${guide.name}</h3>
          <p class="guide-card__desc">${guide.desc}</p>
          <div class="guide-card__footer">
            <div class="guide-card__price"><strong>${formatMoneyMXN(guide.priceMXN)}</strong> / hora</div>
            <button class="guide-card__btn" type="button" data-guide-id="${guide.id}">
              Contactar
              <span class="material-symbols-outlined" aria-hidden="true">send</span>
            </button>
          </div>
        </div>
      `;

      card.querySelector("[data-guide-id]")?.addEventListener("click", (event) => {
        event.stopPropagation();
        window.dispatchEvent(new CustomEvent("tourist-chat:open"));
      });

      dom.recommendedGuides.appendChild(card);
    });
  }

  function renderDestinations() {
    if (!dom.destinationGrid) return;
    dom.destinationGrid.innerHTML = "";

    state.destinations.forEach((destination) => {
      const card = document.createElement("div");
      card.className = `destination-card ${destination.wide ? "destination-card--wide" : ""}`;
      card.innerHTML = `
        <div class="destination-card__media" style="background-image:url('${destination.image}');"></div>
        <div class="destination-card__overlay" aria-hidden="true"></div>
        <div class="destination-card__content">
          <h3 class="destination-card__title">${destination.title}</h3>
          <p class="destination-card__subtitle">${destination.subtitle}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = "./explore.html";
      });

      dom.destinationGrid.appendChild(card);
    });
  }

  function renderSavedGuides() {
    if (!dom.savedGuides) return;
    dom.savedGuides.innerHTML = "";

    state.savedGuides.forEach((guide) => {
      const li = document.createElement("li");
      li.className = "saved-item";
      li.innerHTML = `
        <div class="saved-item__avatar" style="background-image:url('${guide.avatar}');"></div>
        <div class="saved-item__meta">
          <div class="saved-item__name">${guide.name}</div>
          <div class="saved-item__place">${guide.place}</div>
        </div>
        <button class="saved-item__fav" type="button" data-saved-id="${guide.id}" aria-label="Quitar de favoritos">
          <span class="material-symbols-outlined" aria-hidden="true">favorite</span>
        </button>
      `;

      li.querySelector("[data-saved-id]")?.addEventListener("click", async (event) => {
        event.stopPropagation();
        const id = event.currentTarget.getAttribute("data-saved-id");
        try {
          if (window.KCSupportService?.deleteFavoriteGuide) {
            const touristId = normalizeId(state.touristId, state.touristId);
            await window.KCSupportService.deleteFavoriteGuide(touristId, id);
          }
        } catch (error) {
          console.warn("Remove favorite pending backend implementation:", error);
        }
        state.savedGuides = state.savedGuides.filter((item) => item.id !== id);
        renderSavedGuides();
      });

      dom.savedGuides.appendChild(li);
    });
  }

  function applyLocalSearch(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      renderRecommendedGuides(state.recommendedGuides);
      return;
    }
    const filtered = state.recommendedGuides.filter((guide) => {
      return (
        guide.name.toLowerCase().includes(normalized) ||
        guide.desc.toLowerCase().includes(normalized) ||
        guide.tags.some((tag) => tag.toLowerCase().includes(normalized))
      );
    });
    renderRecommendedGuides(filtered);
  }

  function bind() {
    dom.msgBadge = document.getElementById("msgBadge");
    dom.userName = document.getElementById("userName");
    dom.btnLogout = document.getElementById("btnLogout");
    dom.searchInput = document.getElementById("searchInput");

    dom.nextTripMedia = document.getElementById("nextTripMedia");
    dom.nextTripDestination = document.getElementById("nextTripDestination");
    dom.nextTripTitle = document.getElementById("nextTripTitle");
    dom.nextTripDates = document.getElementById("nextTripDates");
    dom.nextTripStatus = document.getElementById("nextTripStatus");
    dom.nextTripGuideAvatar = document.getElementById("nextTripGuideAvatar");
    dom.nextTripGuideName = document.getElementById("nextTripGuideName");
    dom.btnChatGuide = document.getElementById("btnChatGuide");
    dom.btnTripDetails = document.getElementById("btnTripDetails");
    dom.btnTripManage = document.getElementById("btnTripManage");

    dom.recommendedGuides = document.getElementById("recommendedGuides");
    dom.destinationGrid = document.getElementById("destinationGrid");
    dom.savedGuides = document.getElementById("savedGuides");

    dom.btnNewTrip = document.getElementById("btnNewTrip");
    dom.btnChat = document.getElementById("btnChat");
    dom.btnViewAllGuides = document.getElementById("btnViewAllGuides");
    dom.btnSavedAll = document.getElementById("btnSavedAll");
    dom.btnExploreMore = document.getElementById("btnExploreMore");

    dom.btnLogout?.addEventListener("click", () => {
      window.location.href = "../../../index.html";
    });

    dom.searchInput?.addEventListener("input", (event) => {
      applyLocalSearch(event.target.value);
    });

    dom.btnChatGuide?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("tourist-chat:open"));
    });

    dom.btnTripDetails?.addEventListener("click", () => {
      window.location.href = "./trips.html";
    });

    dom.btnTripManage?.addEventListener("click", () => {
      window.location.href = "./trips.html";
    });

    dom.btnNewTrip?.addEventListener("click", () => {
      window.location.href = "./trips.html";
    });

    dom.btnChat?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("tourist-chat:open"));
    });

    dom.btnViewAllGuides?.addEventListener("click", () => {
      window.location.href = "./explore.html";
    });

    dom.btnSavedAll?.addEventListener("click", () => {
      window.location.href = "./favorites.html";
    });

    dom.btnExploreMore?.addEventListener("click", () => {
      window.location.href = "./explore.html";
    });
  }

  function renderAll() {
    renderUser();
    renderNextTrip();
    renderRecommendedGuides(state.recommendedGuides);
    renderDestinations();
    renderSavedGuides();
  }

  async function init() {
    bind();
    renderLoadingState();
    await hydrateFromApi();
    renderAll();
  }

  return { init };
})();

const bootstrapTouristDashboard = () => {
  const run = () => TouristDashboardApp.init();
  const sidebarReady = window.__touristSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapTouristDashboard, { once: true });
} else {
  bootstrapTouristDashboard();
}
