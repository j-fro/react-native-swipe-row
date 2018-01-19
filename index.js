define("SwipeRow", ["require", "exports", "react", "react-native"], function (require, exports, react_1, react_native_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_THRESHOLD_PERCENT = 0.5;
    const DEFAULT_SENSITIVITY = 0.5;
    var Direction;
    (function (Direction) {
        Direction[Direction["None"] = 0] = "None";
        Direction[Direction["Left"] = 1] = "Left";
        Direction[Direction["Right"] = 2] = "Right";
    })(Direction || (Direction = {}));
    class SwipeRow extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.handlePanResponderMove = (event, gesture) => {
                const swipingDirection = gesture.dx > 0 ? Direction.Right : Direction.Left;
                this.setState({ swipingDirection });
                this.state.swiperLayout.setValue({ x: gesture.dx, y: 0 });
            };
            this.handlePanResponderEnd = (event, gesture) => {
                const { swipingDirection } = this.state;
                if (swipingDirection === Direction.Right &&
                    gesture.dx > this.getThresholdValue(Direction.Right)) {
                    if (typeof this.props.onSwipeRight === 'function') {
                        this.props.onSwipeRight();
                    }
                    this.swipeToEndAndReset();
                }
                else if (swipingDirection === Direction.Left &&
                    gesture.dx < -this.getThresholdValue(Direction.Left)) {
                    if (typeof this.props.onSwipeLeft === 'function') {
                        this.props.onSwipeLeft();
                    }
                    this.swipeToEndAndReset();
                }
                else {
                    this.resetSwiper();
                }
            };
            this.handleShouldSetPanResponder = (event, gesture) => {
                if (this.state.swipingDirection !== Direction.None) {
                    return false;
                }
                if (gesture.dx < -this.getSensivity() && this.props.canSwipeLeft) {
                    return true;
                }
                if (gesture.dx > this.getSensivity() && this.props.canSwipeRight) {
                    return true;
                }
                return false;
            };
            this.handleContainerLayout = (event) => {
                this.setState({ containerLayout: { ...event.nativeEvent.layout } });
            };
            this.state = {
                swipingDirection: Direction.None,
                swiperLayout: new react_native_1.Animated.ValueXY({ x: 0, y: 0 }),
                rawSwiperXValue: 0,
                containerLayout: { x: 0, y: 0, height: 0, width: 0 }
            };
            this.state.swiperLayout.addListener(value => this.setState({ rawSwiperXValue: value.x }));
            this.panResponders = react_native_1.PanResponder.create({
                onStartShouldSetPanResponder: this.handleShouldSetPanResponder,
                onStartShouldSetPanResponderCapture: this.handleShouldSetPanResponder,
                onMoveShouldSetPanResponder: this.handleShouldSetPanResponder,
                onMoveShouldSetPanResponderCapture: this.handleShouldSetPanResponder,
                onPanResponderMove: this.handlePanResponderMove,
                onPanResponderEnd: this.handlePanResponderEnd,
                onPanResponderTerminationRequest: () => false
            });
        }
        getSensivity() {
            return this.props.swipeSensivity || DEFAULT_SENSITIVITY;
        }
        getThresholdValue(direction) {
            if (direction === Direction.Left) {
                if (this.props.thresholdLeft) {
                    return this.props.thresholdLeft;
                }
                return this.calculateThresholdFromPercent(this.props.thresholdLeftPercent);
            }
            else {
                if (this.props.thresholdRight) {
                    return this.props.thresholdRight;
                }
                return this.calculateThresholdFromPercent(this.props.thresholdRightPercent);
            }
        }
        calculateThresholdFromPercent(percent) {
            const { width } = this.state.containerLayout;
            return (percent || DEFAULT_THRESHOLD_PERCENT) * width;
        }
        swipeToEndAndReset() {
            const multiplier = this.state.swipingDirection === Direction.Right ? 1 : -1;
            const toValue = this.state.containerLayout.width * multiplier;
            this.getSwiperAnimation(toValue).start(() => setTimeout(() => this.resetSwiper(), 500));
        }
        resetSwiper() {
            this.getSwiperAnimation(0).start(() => this.setState({ swipingDirection: Direction.None }));
        }
        getSwiperAnimation(toValue) {
            let duration = 500;
            const percentage = Math.abs(this.state.rawSwiperXValue - toValue) / this.state.containerLayout.width;
            duration = duration * percentage;
            return react_native_1.Animated.timing(this.state.swiperLayout.x, {
                toValue,
                duration,
                easing: react_native_1.Easing.out(react_native_1.Easing.cubic)
            });
        }
        render() {
            const { children, style, rowStyle, rightUnderlayStyle, rightUnderlay, leftUnderlay, leftUnderlayStyle, ...props } = this.props;
            return (<react_native_1.View style={style} onLayout={this.handleContainerLayout}>
                {this.state.swipingDirection === Direction.Right && (<react_native_1.View style={[styles.underlay, styles.underlayRight, rightUnderlayStyle]}>
                        {rightUnderlay}
                    </react_native_1.View>)}
                {this.state.swipingDirection === Direction.Left && (<react_native_1.View style={[styles.underlay, styles.underlayLeft, leftUnderlayStyle]}>
                        {leftUnderlay}
                    </react_native_1.View>)}
                <react_native_1.Animated.View style={[styles.row, this.state.swiperLayout.getLayout(), rowStyle]} {...this.panResponders.panHandlers} {...props}>
                    {this.props.children}
                </react_native_1.Animated.View>
            </react_native_1.View>);
        }
    }
    exports.default = SwipeRow;
    const styles = react_native_1.StyleSheet.create({
        row: {
            backgroundColor: 'white'
        },
        underlay: {
            ...react_native_1.StyleSheet.absoluteFillObject,
            alignItems: 'center'
        },
        underlayLeft: {
            backgroundColor: 'orange'
        },
        underlayRight: {
            backgroundColor: 'red'
        }
    });
});
define("index", ["require", "exports", "SwipeRow", "SwipeRow"], function (require, exports, SwipeRow_1, SwipeRow_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(SwipeRow_1);
    exports.default = SwipeRow_2.default;
});
//# sourceMappingURL=index.js.map