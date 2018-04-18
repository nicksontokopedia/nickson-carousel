//CENTER MODE
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
			centerMode: true,
			pSpaceBetween: 5,
			pSlideWidth: 20
		}
		$.extend(_.defaults, options);
		$.extend(_, _.defaults);

		//dom
		_.$dom = dom;
		_.$slides = dom.children('div');
		_.$slideContainer = null;
		_.$dotContainer = null;
		_.$prevArrow = null;
		_.$nextArrow = null;
		_.$centerMode = null;

		//unchangeable properties for self use
		_.total = _.$slides.length;
		_.blockSlide = false;
		_.slideIndex = 0;

		//only for center mode
		_.center = Math.ceil(_.total/2) - 1;
		_.half = Math.floor(_.total/ 2);
		_.pScrollAmount = _.pSpaceBetween + _.pSlideWidth;
		_.pSideWidth = (100 - (_.pSpaceBetween * 2 + _.pSlideWidth))/2;
		_.minLoc = _.pSideWidth + _.pSpaceBetween - (_.half * _.pScrollAmount);
		_.maxLoc = _.minLoc + ((_.total - 1) * _.pScrollAmount);
		_.$slideToRemove = null;

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
		_.$slides.each(function(i) {
			$(this).attr('index', i + 1);
		});

		_.$slides.addClass('carousel__slide--center-mode');
		_.$slides.css('height', '100%');
		$(_.$slides[_.center]).addClass('carousel__slide--center');
		_.$slides.not($(_.$slides[_.center])).addClass('carousel__slide--blur');
		_.$slides.each(function(i) {
			$(this).css('width', _.pSlideWidth + '%').css('left', _.minLoc + (i * _.pScrollAmount) + '%');
		})
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
		_.$prevArrow.on('click', function(){return _.prev(false);});
		_.$nextArrow.on('click', function(){return _.next(false);});
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
				for (var i=0;i <= _.total; ++i) {
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
		for (var i=0;i<6;++i) {
			_.next(true);
		}
	}

	Carousel.prototype.next = function(goTo) {
		var _ = this;
		if (!_.blockSlide || goTo) {
			_.updateDom();
			_.slideIndex += 1;
			$(_.$slides[0]).css('left', _.maxLoc + _.pScrollAmount + '%');
			_.$slideContainer.append($(_.$slides[0]).clone());
			_.$slideToRemove = _.$slides[0];
			_.updateCarousel();
		}
	};

	Carousel.prototype.prev = function (goTo) {
		var _ = this;
		if (!_.blockSlide || goTo) {
			_.updateDom();
			_.slideIndex -= 1;
			$(_.$slides[_.$slides.length - 1]).css('left', _.minLoc - _.pScrollAmount + '%');
			_.$slideContainer.prepend($(_.$slides[_.$slides.length - 1]).clone());
			_.$slideToRemove = _.$slides[_.$slides.length - 1];
			_.updateCarousel();
		}
	};

	Carousel.prototype.stop = function () {
		var _ = this;
		clearInterval(_.interval);
	};

	Carousel.prototype.updateCarousel = function(initial) {	
		var _ = this;
		if (_.defaults.blockWhileSlide && !initial) {
			_.blockSlide = true;
		}
		_.$slideContainer.animate({
				left: (-(_.pScrollAmount) * _.slideIndex) + '%'
			},
			{
				complete: function() {
					if (_.$slideToRemove) {_.$slideToRemove.remove();};
					_.reset();
					_.updateDom();
					_.$slideContainer.find('.carousel__slide--center').removeClass('carousel__slide--center').addClass('carousel__slide--blur');
					$(_.$slides[_.center]).removeClass('carousel__slide--blur').addClass('carousel__slide--center');
					_.blockSlide = false;
				},
				duration: 450
			}
		);

		//handle Dots
		_.$dots.removeClass('carousel__dot--active');
		$(_.$dots[_.slideIndex % (_.total + 1)]).addClass('carousel__dot--active');
	};

	Carousel.prototype.updateDom = function() {
		var _ = this;
		_.$slides = _.$dom.find('.carousel__slide');
	}

	Carousel.prototype.reset = function() {
		var _ = this;
		_.updateDom();
		_.$slideContainer.css('left', '0%');
		_.$slides.each(function(i) {
			$(this).css('left', _.minLoc + (i * _.pScrollAmount) + '%');
		});
		_.slideIndex = 0;
	}

	$(document).ready(function() {
		var options = {};
		$('#carousel').carousel(options);
	});
}(jQuery));