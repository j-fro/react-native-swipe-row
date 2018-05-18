import React from 'react';
import { Animated, View, PanResponder, Easing, StyleSheet } from 'react-native';
const DEFAULT_THRESHOLD_PERCENT = 0.5;
const DEFAULT_SENSITIVITY = 0.5;
var Direction;
(function (Direction) {
    Direction[Direction["None"] = 0] = "None";
    Direction[Direction["Left"] = 1] = "Left";
    Direction[Direction["Right"] = 2] = "Right";
})(Direction || (Direction = {}));
export default class SwipeRow extends React.Component {
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
                this.swipeToEndAndReset();
            }
            else if (swipingDirection === Direction.Left &&
                gesture.dx < -this.getThresholdValue(Direction.Left)) {
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
            swiperLayout: new Animated.ValueXY({ x: 0, y: 0 }),
            rawSwiperXValue: 0,
            containerLayout: { x: 0, y: 0, height: 0, width: 0 }
        };
        this.state.swiperLayout.addListener(value => this.setState({ rawSwiperXValue: value.x }));
        this.panResponders = PanResponder.create({
            onStartShouldSetPanResponder: this.handleShouldSetPanResponder,
            onStartShouldSetPanResponderCapture: this.handleShouldSetPanResponder,
            onMoveShouldSetPanResponder: this.handleShouldSetPanResponder,
            onMoveShouldSetPanResponderCapture: this.handleShouldSetPanResponder,
            onPanResponderMove: this.handlePanResponderMove,
            onPanResponderEnd: this.handlePanResponderEnd,
            onPanResponderTerminationRequest: () => false
        });
    }
    componentWillUnmount() {
        if (this.resetSwiperTimer) {
            clearInterval(this.resetSwiperTimer);
        }
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
        this.getSwiperAnimation(toValue).start(() => {
            this.triggerThresholdAction();
            this.resetSwiperTimer = setTimeout(() => {
                this.resetSwiper();
                this.resetSwiperTimer = null;
            }, 500);
        });
    }
    triggerThresholdAction() {
        if (this.state.swipingDirection === Direction.Right &&
            typeof this.props.onSwipeRight === 'function') {
            this.props.onSwipeRight();
        }
        if (this.state.swipingDirection === Direction.Left &&
            typeof this.props.onSwipeLeft === 'function') {
            this.props.onSwipeLeft();
        }
    }
    resetSwiper() {
        this.getSwiperAnimation(0).start(() => this.setState({ swipingDirection: Direction.None }));
    }
    getSwiperAnimation(toValue) {
        let duration = 500;
        const percentage = Math.abs(this.state.rawSwiperXValue - toValue) / this.state.containerLayout.width;
        duration = duration * percentage;
        return Animated.timing(this.state.swiperLayout.x, {
            toValue,
            duration,
            easing: Easing.out(Easing.cubic)
        });
    }
    render() {
        const { children, style, rowStyle, rightUnderlayStyle, rightUnderlay, leftUnderlay, leftUnderlayStyle, ...props } = this.props;
        return (<View style={style} onLayout={this.handleContainerLayout}>
                {this.state.swipingDirection === Direction.Right && (<View style={[styles.underlay, styles.underlayRight, rightUnderlayStyle]}>
                        {rightUnderlay}
                    </View>)}
                {this.state.swipingDirection === Direction.Left && (<View style={[styles.underlay, styles.underlayLeft, leftUnderlayStyle]}>
                        {leftUnderlay}
                    </View>)}
                <Animated.View style={[styles.row, this.state.swiperLayout.getLayout(), rowStyle]} {...this.panResponders.panHandlers} {...props}>
                    {this.props.children}
                </Animated.View>
            </View>);
    }
}
const styles = StyleSheet.create({
    row: {
        backgroundColor: 'white'
    },
    underlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center'
    },
    underlayLeft: {
        backgroundColor: 'orange'
    },
    underlayRight: {
        backgroundColor: 'red'
    }
});
//# sourceMappingURL=SwipeRow.js.map