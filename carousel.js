(function ($) {
	var carArr = [];
	var carCt = 0;

	$.fn.carousel = function(options) {
		var object = new Carousel(this, options);
		carArr.push(object);
	};

	function Carousel(dom, options) {
		var _ = this;
		_.defaults = {
			navArrows: true,
			navDots: true,
			showArrowOnHoverOnly: true,
			blockWhileSlide: true,
			autoSlide: false,
			slideToShow: 4,
			slideToSkip: 2,
			pSpaceBetween: 0
		}
		$.extend(_.defaults, options);
		$.extend(_, _.defaults);

		//dom
		_.$dom = dom;
		_.domWidth = parseInt(_.$dom.css('width'));
		_.$slides = dom.children('div');
		_.$slideContainer = null;
		_.$dotContainer = null;
		_.$prevArrow = null;
		_.$nextArrow = null;

		//unchangeable properties for self use
		_.total = _.$slides.length;
		_.maxSlide = Math.ceil((_.total - _.slideToShow)/_.slideToSkip + 1);
		_.slideIndex = 0;
		_.blockSlide = false;

		//bind functions
		_.prev = $.proxy(_.prev, _);
		_.next = $.proxy(_.next, _);

		_.init();

		carCt++;//update count of carousel on this page each time carousel is added
	}

	Carousel.prototype.init = function() {
		var _ = this;
		_.$dom.addClass('carousel__main-container');
		_.setSlide();
		_.generateArrow();
		_.generateDots();
		_.addEvents();
		_.generateAutoSlide();
		_.updateCarousel(true);
	}

	Carousel.prototype.setSlide = function() {
		var _ = this;
		_.$slides.wrapAll('<div class="carousel__slide-container"></div>');
		_.$slides.addClass('carousel__slide');
		_.$slideContainer = _.$dom.find('.carousel__slide-container');
		_.$slideContainer.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
			_.blockSlide = false;
			if (_.autoSlide) { //move slide to next if auto
				clearInterval(_.interval);
				_.interval = setTimeout(function(){
				_.next();}, 3000);
			}
		});
		_.$slides.each(function(i) {
			$(this).attr('index', i + 1);
		});
		_.$slideContainer.css('left', -(_.pSpaceBetween) + '%');
		var pWidth = (100 - (_.pSpaceBetween * (_.slideToShow + 1)))/parseInt(_.slideToShow);

		_.$slides.css('width', pWidth + '%').css('height', '100%');
		_.$slides.each(function(i) {
			$(this).css('left', (_.pSpaceBetween + i * (pWidth + _.pSpaceBetween)) + '%');
		});
	}

	Carousel.prototype.generateAutoSlide = function() {
		var _ = this;
		if (_.autoSlide) {
			_.interval = setTimeout(function(){
				_.next();}, 3000);
		}
	}

	Carousel.prototype.addEvents = function() {
		var _ = this;
		_.$prevArrow.on('click', _.prev);
		_.$nextArrow.on('click', _.next);
		_.$dots.each(function() {
			$(this).on('click', function() {return _.goTo($(this).attr('index'))});
		});
	}

	Carousel.prototype.generateArrow = function(prevArrow, nextArrow) {
		var _ = this;
		if (_.defaults.navArrows) {
			var html = '<div class="carousel__arrow-container">';
				if (prevArrow) {
					html += prevArrow;
				} else { 
					html += '<div class="carousel__prev-arrow">';
						html += '<i class="carousel__arrow-icon fas fa-angle-left"></i>';
					html += '</div>';
				}
				if (nextArrow) {
					html += nextArrow;
				} else {
					html += '<div class="carousel__next-arrow">';
						html += '<i class="carousel__arrow-icon fas fa-angle-right"></i>';
					html += '</div>';
				}
			html += '</div>';
			_.$dom.prepend(html);
		}
		_.$arrowContainer = _.$dom.find('.carousel__arrow-container');
		_.$prevArrow = _.$dom.find('.carousel__prev-arrow');
		_.$nextArrow = _.$dom.find('.carousel__next-arrow');

		if (_.showArrowOnHoverOnly) {
			_.$dom.addClass('display-arrow-on-hover');
		}
	};

	Carousel.prototype.generateDots = function() {
		var _ = this;
		if (_.defaults.navDots) {
			var html = '<div class="carousel__dot-container">';
				for (var i=0;i < _.maxSlide; ++i) {
					html += '<div class="carousel__dot" index="'+i+'"></div>';
				}
			html += '</div>';
			_.$dom.append(html);
		}
		_.$dotContainer = _.$dom.find('.carousel__dot-container');
		_.$dots = _.$dom.find('.carousel__dot');
	}

	Carousel.prototype.goTo = function(index) {
		var _ = this;
		_.slideIndex = parseInt(index);
		_.updateCarousel();
	}

	Carousel.prototype.next = function(interval) {
		var _ = this;
		console.log('JIGONG');

		if (!_.blockSlide) {
			(_.slideIndex === _.maxSlide - 1) ? _.slideIndex = 0 : _.slideIndex += 1;
			_.updateCarousel();
		}
	};

	Carousel.prototype.prev = function (interval) {
		var _ = this;
		if (!_.blockSlide) {
			(_.slideIndex === 0) ? _.slideIndex = _.maxSlide - 1 : _.slideIndex -= 1;
			_.updateCarousel();
		}
	};

	Carousel.prototype.updateCarousel = function (initial) {	
		var _ = this;
		if (_.defaults.blockWhileSlide && !initial) {
			_.blockSlide = true;
		}

		var location = -(parseInt($(_.$slides[_.slideIndex * _.slideToSkip]).css('left'))/_.domWidth * 100 - _.pSpaceBetween);
		_.$slideContainer.css('left', location + "%");
		_.$dots.removeClass('carousel__dot--active');
		$(_.$dots[_.slideIndex]).addClass('carousel__dot--active');
	};

	$(document).ready(function() {
		var options = {};
		$('#carousel').carousel(options);
	});
}(jQuery));