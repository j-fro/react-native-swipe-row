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
    Text
} from 'react-native';

const DEFAULT_THRESHOLD_PERCENT = 0.6;
const DEFAULT_SENSITIVITY = 0.5;

export interface SwipeRowProps extends ViewProperties {
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
    isResetting: boolean;
    swipingDirection: Direction;
    swiperLayout: Animated.ValueXY;
    containerLayout: LayoutRectangle;
}

type GestureResponder<T> = (event: GestureResponderEvent, gesture: PanResponderGestureState) => T;

export default class SwipeRow extends React.Component<SwipeRowProps, SwipeRowState> {
    private panResponders: PanResponderInstance;

    public constructor(props: SwipeRowProps) {
        super(props);

        this.state = {
            isResetting: false,
            swipingDirection: Direction.None,
            swiperLayout: new Animated.ValueXY({ x: 0, y: 0 }),
            containerLayout: { x: 0, y: 0, height: 0, width: 0 }
        };

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
            this.swipeToEndAndReset();
        } else if (
            swipingDirection === Direction.Left &&
            gesture.dx < this.getThresholdValue(Direction.Left)
        ) {
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
        Animated.spring(this.state.swiperLayout.x, { toValue }).start(() => this.resetSwiper());
    }

    private resetSwiper(): void {
        Animated.spring(this.state.swiperLayout.x, { toValue: 0 }).start(() =>
            this.setState({ isResetting: false, swipingDirection: Direction.None })
        );
    }

    private handleContainerLayout = (event: LayoutChangeEvent) => {
        this.setState({ containerLayout: { ...event.nativeEvent.layout } });
    };

    public render(): JSX.Element {
        const { children, style, ...props } = this.props;
        return (
            <View style={style} onLayout={this.handleContainerLayout}>
                {this.state.swipingDirection === Direction.Right && (
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'red',
                            alignItems: 'center'
                            // width: this.state.layout.x
                        }}
                    >
                        <Text>DELETE</Text>
                    </Animated.View>
                )}
                {this.state.swipingDirection === Direction.Left && (
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0,
                            backgroundColor: 'blue',
                            alignItems: 'center'
                            // width: this.state.layout.x
                        }}
                    >
                        <Text>NOT DELETE</Text>
                    </Animated.View>
                )}
                <Animated.View
                    style={[{ backgroundColor: 'white' }, this.state.swiperLayout.getLayout()]}
                    {...this.panResponders.panHandlers}
                    {...props}
                >
                    {this.props.children}
                </Animated.View>
            </View>
        );
    }
}
