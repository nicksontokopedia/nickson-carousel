//CENTER MODE
(function ($) {
	var carArr = [];
	var carCt = 0;

	$.fn.carousel = function(options) {
		if (options.type == 'centerMode') {
			var object = new CarouselStandard(this, options);
			carArr.push(object);
		}
	};

	$(document).ready(function() {
		var options = {type: 'centerMode'};
		$('#carousel').carousel(options);
	});

	function Carousel(dom) {
		var _ = this;
		_.defaults = {
			navArrows: true,
			navDots: true,
			showArrowOnHoverOnly: true,
			autoSlide: false,
			pSpaceBetween: 5,
			pSlideWidth: 20
		}

		//dom
		_.$dom = dom;
		_.$slides = dom.children('div');
		_.$slideContainer = null;
		_.$dotContainer = null;
		_.$prevArrow = null;
		_.$nextArrow = null;

		//unchangeable properties for self use
		_.total = _.$slides.length;
		_.blockSlide = false;

		carCt++;//update count of carousel on this page each time carousel is added
	}

	Carousel.prototype.generateAutoSlide = function() {
		var _ = this;
		if (_.autoSlide) {
			_.interval = setTimeout(function(){
				_.next();}, 3000);
		}
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

	Carousel.prototype.stop = function () {
		var _ = this;
		clearInterval(_.interval);
	};

	Carousel.prototype.updateDom = function() {
		var _ = this;
		_.$slides = _.$dom.find('.carousel__slide');
	}


	//CAROUSEL	CENTER MODE
	function CarouselCenter(dom, options) {
		var _ = this;

		Carousel.call(this, dom);
		_.defaults = {
			navArrows: true,
			navDots: true,
			autoSlide: false,
			centerMode: true,
			pSpaceBetween: 5,
			pSlideWidth: 20,
			blockWhileSlide: true
		}

		$.extend(_.defaults, options);
		$.extend(_, _.defaults);

		//only for center mode
		_.centerIndex = (_.total % 2 == 0) ? _.total/2 : Math.ceil(_.total/2) - 1; //center index for even vs odd
		_.half = Math.floor(_.total/ 2);
		_.pScrollAmount = _.pSpaceBetween + _.pSlideWidth;
		_.pSideWidth = (100 - (_.pSpaceBetween * 2 + _.pSlideWidth))/2;
		_.minLoc = _.pSideWidth + _.pSpaceBetween - (_.half * _.pScrollAmount);
		_.maxLoc = _.minLoc + ((_.total - 1) * _.pScrollAmount);
		_.$slidesToRemove = [];

		//bind functions
		_.prev = $.proxy(_.prev, _);
		_.next = $.proxy(_.next, _);

		_.init();
	}

	CarouselCenter.prototype = Object.create(Carousel.prototype);

    CarouselCenter.prototype.init = function() {
		var _ = this;
		_.$dom.addClass('carousel__main-container');
		_.setSlide();
		_.generateArrow();
		_.generateDots();
		_.addEvents();
		_.generateAutoSlide();
		_.updateCarousel();
	}

	CarouselCenter.prototype.generateDots = function() {
		var _ = this;
		if (_.defaults.navDots) {
			var html = '<div class="carousel__dot-container">';
				for (var i=0;i < _.total; ++i) {
					//html += '<div class="carousel__dot" index="'+ i +'" slide-index="'+ ((_.centerIndex +i) % (_.total)) +'"></div>';
					html += '<div class="carousel__dot" index="'+ i +'" slide-index="' + i + '"></div>';
				}
			html += '</div>';
			_.$dom.append(html);
		}

		_.$dotContainer = _.$dom.find('.carousel__dot-container');
		_.$dots = _.$dom.find('.carousel__dot');
		$(_.$dots[0]).addClass('carousel__dot--active');
	}

	CarouselCenter.prototype.setSlide = function() {
		var _ = this;
		_.$slides.wrapAll('<div class="carousel__slide-container"></div>');
		_.$slides.addClass('carousel__slide');
		_.$slides.css('height', '100%');
		_.$slideContainer = _.$dom.find('.carousel__slide-container');
		_.$slides.each(function(i) {
			$(this).attr('index', i);
		});

		for (var i=0;i < _.centerIndex; ++i) {
			_.$slideContainer.prepend($(_.$slides[_.$slides.length - 1 - i]));
		}
		_.updateDom();

		_.$slides.each(function(i) {
			$(this).css('width', _.pSlideWidth + '%').css('left', _.minLoc + (i * _.pScrollAmount) + '%'); //place all slides in position
		});

		_.$slides.addClass('carousel__slide--center-mode');
		$(_.$slides[_.centerIndex]).addClass('carousel__slide--center');
		_.$slides.not($(_.$slides[_.centerIndex])).addClass('carousel__slide--blur');
	}

	CarouselCenter.prototype.addEvents = function() {
		var _ = this;
		_.$prevArrow.on('click', function(){_.goTo(-1);});
		_.$nextArrow.on('click', function(){_.goTo(1);});
		_.$dots.on('click', function() {
			_.goTo($(this).attr('index') - _.$dotContainer.find('.carousel__dot--active').attr('index'));
		});
	}

	Carousel.prototype.goTo = function(offset) {
		var _ = this;
		if (!_.blockSlide) {
			var newIndex = ((_.centerIndex + offset) % _.total);
			if (newIndex < 0) {
				newIndex = _.total + newIndex;
			}
			var $newCenter = $(_.$slides[newIndex]);
			_.$slideContainer.find('.carousel__slide--center').removeClass('carousel__slide--center').addClass('carousel__slide--blur');
			$newCenter.removeClass('carousel__slide--blur').addClass('carousel__slide--center');
			_.$dots.removeClass('carousel__dot--active');
			$(_.$dots.filter('[slide-index=' + $newCenter.attr('index') +']')).addClass('carousel__dot--active');
			if (offset < 0) {
				for (var i=0;i < Math.abs(offset); ++i) {
					_.$slideContainer.prepend($(_.$slides[_.$slides.length - 1 - i]).clone().css('left', _.minLoc - (_.pScrollAmount * (i + 1)) + '%'));
					_.$slidesToRemove.push($(_.$slides[_.$slides.length - 1 - i]));
				}
			}
			else {
				for (var i=0;i < offset; ++i) {
					_.$slideContainer.append($(_.$slides[i]).clone().css('left', _.maxLoc + (_.pScrollAmount * (i + 1)) + '%'));
					_.$slidesToRemove.push($(_.$slides[i]));
				}
			}
			_.updateCarousel(offset);
		}
	}

	CarouselCenter.prototype.stop = function () {
		var _ = this;
		clearInterval(_.interval);
	};

	CarouselCenter.prototype.updateCarousel = function(slideMoved = 0) {	
		var _ = this;
		if (_.defaults.blockWhileSlide) {
			_.blockSlide = true;
		}
		_.$slideContainer.animate({
				left: (-(_.pScrollAmount) * slideMoved) + '%'
			},
			{
				complete: function() {
					if (_.$slidesToRemove.length > 0) {
						for (var i=0; i < _.$slidesToRemove.length; ++i) {
							$(_.$slidesToRemove[i]).remove();//WHAT IF SLIDE IS NOT BLOCKED??
						}
					};
					_.$slidesToRemove = [];
					_.updateDom();
					_.reset();
					_.blockSlide = false;
				},
				duration: 450
			}
		);
	};
	

	CarouselCenter.prototype.updateDom = function() {
		var _ = this;
		_.$slides = _.$dom.find('.carousel__slide');
	}

	CarouselCenter.prototype.reset = function() {
		var _ = this;
		_.updateDom();
		_.$slideContainer.css('left', '0%');
		_.$slides.each(function(i) {
			$(this).css('left', _.minLoc + (i * _.pScrollAmount) + '%');
		});
	}

	//Standard Carousel

	function CarouselStandard(dom, options) {
		var _ = this;

		Carousel.call(this, dom);
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


		//unchangeable properties for self use
		_.domWidth = parseInt(_.$dom.css('width'));
		_.maxScroll = Math.ceil((_.total - _.slideToShow)/_.slideToSkip + 1);
		_.slideIndex = 0;
		_.blockSlide = false;

		//bind functions
		_.prev = $.proxy(_.prev, _);
		_.next = $.proxy(_.next, _);

		_.init();
	}

	CarouselStandard.prototype = Object.create(Carousel.prototype);

	CarouselStandard.prototype.init = function() {
		var _ = this;
		_.$dom.addClass('carousel__main-container');
		_.setSlide();
		_.generateArrow();
		_.generateDots();
		_.addEvents();
		_.generateAutoSlide();
		_.updateCarousel();
	}

	CarouselStandard.prototype.setSlide = function() {
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

	CarouselStandard.prototype.generateAutoSlide = function() {
		var _ = this;
		if (_.autoSlide) {
			_.interval = setTimeout(function(){
				_.next();}, 3000);
		}
	}

	CarouselStandard.prototype.addEvents = function() {
		var _ = this;
		_.$prevArrow.on('click', _.prev);
		_.$nextArrow.on('click', _.next);
		_.$dots.each(function() {
			$(this).on('click', function() {return _.goTo($(this).attr('index'))});
		});
	}

	CarouselStandard.prototype.generateDots = function() {
		var _ = this;
		if (_.defaults.navDots) {
			var html = '<div class="carousel__dot-container">';
				for (var i=0;i < _.maxScroll; ++i) {
					html += '<div class="carousel__dot" index="'+i+'"></div>';
				}
			html += '</div>';
			_.$dom.append(html);
		}
		_.$dotContainer = _.$dom.find('.carousel__dot-container');
		_.$dots = _.$dom.find('.carousel__dot');
		$(_.$dots[_.slideIndex]).addClass('carousel__dot--active');
	}

	CarouselStandard.prototype.goTo = function(index) {
		var _ = this;
		_.slideIndex = parseInt(index);
		_.updateCarousel();
	}

	CarouselStandard.prototype.next = function(interval) {
		var _ = this;

		if (!_.blockSlide) {
			(_.slideIndex === _.maxScroll - 1) ? _.slideIndex = 0 : _.slideIndex += 1;
			_.updateCarousel();
		}
	};

	CarouselStandard.prototype.prev = function (interval) {
		var _ = this;
		if (!_.blockSlide) {
			(_.slideIndex === 0) ? _.slideIndex = _.maxScroll - 1 : _.slideIndex -= 1;
			_.updateCarousel();
		}
	};

	CarouselStandard.prototype.updateCarousel = function () {	
		var _ = this;
		_.$dots.removeClass('carousel__dot--active');
		$(_.$dots[_.slideIndex]).addClass('carousel__dot--active');
		if (_.defaults.blockWhileSlide) {
			_.blockSlide = true;
		}

		_.$slideContainer.animate({
				left: -(parseInt($(_.$slides[_.slideIndex * _.slideToSkip]).css('left'))/_.domWidth * 100 - _.pSpaceBetween) + '%'
			},
			{
				complete: function() {
					_.updateDom();
					_.blockSlide = false;
					if (_.autoSlide) { //move slide to next if auto
						clearInterval(_.interval);
						_.interval = setTimeout(function(){
						_.next();}, 3000);
					}
				},
				duration: 450
			}
		);
	};

}(jQuery));