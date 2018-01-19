import React from 'react';
import {
    Animated,
    ViewProperties,
    View,
    PanResponderInstance,
    PanResponder,
    GestureResponderEvent,
    PanResponderGestureState,
    LayoutChangeEvent,
    LayoutRectangle,
    Easing,
    StyleProp,
    ViewStyle,
    StyleSheet
} from 'react-native';

const DEFAULT_THRESHOLD_PERCENT = 0.5;
const DEFAULT_SENSITIVITY = 0.5;

export interface SwipeRowProps extends ViewProperties {
    rowStyle?: StyleProp<ViewStyle>;
    leftUnderlayStyle?: StyleProp<ViewStyle>;
    rightUnderlayStyle?: StyleProp<ViewStyle>;
    leftUnderlay?: JSX.Element;
    rightUnderlay?: JSX.Element;
    canSwipeLeft?: boolean;
    canSwipeRight?: boolean;
    thresholdLeft?: number;
    thresholdRight?: number;
    thresholdLeftPercent?: number;
    thresholdRightPercent?: number;
    swipeSensivity?: number;
    onSwipeLeft?(): void;
    onSwipeRight?(): void;
}

enum Direction {
    None,
    Left,
    Right
}

export interface SwipeRowState {
    swipingDirection: Direction;
    swiperLayout: Animated.ValueXY;
    rawSwiperXValue: number;
    containerLayout: LayoutRectangle;
}

type GestureResponder<T> = (event: GestureResponderEvent, gesture: PanResponderGestureState) => T;

export default class SwipeRow extends React.Component<SwipeRowProps, SwipeRowState> {
    private panResponders: PanResponderInstance;

    public constructor(props: SwipeRowProps) {
        super(props);

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

    private handlePanResponderMove: GestureResponder<void> = (event, gesture) => {
        const swipingDirection = gesture.dx > 0 ? Direction.Right : Direction.Left;
        this.setState({ swipingDirection });
        this.state.swiperLayout.setValue({ x: gesture.dx, y: 0 });
    };

    private handlePanResponderEnd: GestureResponder<void> = (event, gesture) => {
        const { swipingDirection } = this.state;
        if (
            swipingDirection === Direction.Right &&
            gesture.dx > this.getThresholdValue(Direction.Right)
        ) {
            if (typeof this.props.onSwipeRight === 'function') {
                this.props.onSwipeRight();
            }
            this.swipeToEndAndReset();
        } else if (
            swipingDirection === Direction.Left &&
            gesture.dx < -this.getThresholdValue(Direction.Left)
        ) {
            if (typeof this.props.onSwipeLeft === 'function') {
                this.props.onSwipeLeft();
            }
            this.swipeToEndAndReset();
        } else {
            this.resetSwiper();
        }
    };

    private handleShouldSetPanResponder: GestureResponder<boolean> = (event, gesture) => {
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

    private getSensivity(): number {
        return this.props.swipeSensivity || DEFAULT_SENSITIVITY;
    }

    private getThresholdValue(direction: Direction): number {
        if (direction === Direction.Left) {
            if (this.props.thresholdLeft) {
                return this.props.thresholdLeft;
            }
            return this.calculateThresholdFromPercent(this.props.thresholdLeftPercent);
        } else {
            if (this.props.thresholdRight) {
                return this.props.thresholdRight;
            }
            return this.calculateThresholdFromPercent(this.props.thresholdRightPercent);
        }
    }

    private calculateThresholdFromPercent(percent?: number): number {
        const { width } = this.state.containerLayout;
        return (percent || DEFAULT_THRESHOLD_PERCENT) * width;
    }

    private swipeToEndAndReset(): void {
        const multiplier = this.state.swipingDirection === Direction.Right ? 1 : -1;
        const toValue = this.state.containerLayout.width * multiplier;
        this.getSwiperAnimation(toValue).start(() => setTimeout(() => this.resetSwiper(), 500));
    }

    private resetSwiper(): void {
        this.getSwiperAnimation(0).start(() => this.setState({ swipingDirection: Direction.None }));
    }

    private getSwiperAnimation(toValue: number): Animated.CompositeAnimation {
        let duration = 500;
        const percentage =
            Math.abs(this.state.rawSwiperXValue - toValue) / this.state.containerLayout.width;
        duration = duration * percentage;
        return Animated.timing(this.state.swiperLayout.x, {
            toValue,
            duration,
            easing: Easing.out(Easing.cubic)
        });
    }

    private handleContainerLayout = (event: LayoutChangeEvent) => {
        this.setState({ containerLayout: { ...event.nativeEvent.layout } });
    };

    public render(): JSX.Element {
        const {
            children,
            style,
            rowStyle,
            rightUnderlayStyle,
            rightUnderlay,
            leftUnderlay,
            leftUnderlayStyle,
            ...props
        } = this.props;
        return (
            <View style={style} onLayout={this.handleContainerLayout}>
                {this.state.swipingDirection === Direction.Right && (
                    <View style={[styles.underlay, styles.underlayRight, rightUnderlayStyle]}>
                        {rightUnderlay}
                    </View>
                )}
                {this.state.swipingDirection === Direction.Left && (
                    <View style={[styles.underlay, styles.underlayLeft, leftUnderlayStyle]}>
                        {leftUnderlay}
                    </View>
                )}
                <Animated.View
                    style={[styles.row, this.state.swiperLayout.getLayout(), rowStyle]}
                    {...this.panResponders.panHandlers}
                    {...props}
                >
                    {this.props.children}
                </Animated.View>
            </View>
        );
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
