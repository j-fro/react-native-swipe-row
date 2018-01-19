import React from 'react';
import {
    Animated,
    ViewProperties,
    View,
    PanResponderInstance,
    PanResponder,
    GestureResponderEvent,
    PanResponderGestureState,
    Text
} from 'react-native';

export interface SwipeRowProps extends ViewProperties {
    canSwipeLeft?: boolean;
    canSwipeRight?: boolean;
    thressholdLeft?: number;
    thressholdRight?: number;
    swipeSensivity?: number;
    onPassThreshholdLeft?(): void;
    onPassThreshholdRight?(): void;
}

enum SwipingDirecton {
    None,
    Left,
    Right
}

export interface SwipeRowState {
    isResetting: boolean;
    swipingDirection: SwipingDirecton;
    layout: Animated.ValueXY;
}

type GestureResponder<T> = (event: GestureResponderEvent, gesture: PanResponderGestureState) => T;

export default class SwipeRow extends React.Component<SwipeRowProps, SwipeRowState> {
    private panResponders: PanResponderInstance;

    public constructor(props: SwipeRowProps) {
        super(props);

        this.state = {
            isResetting: false,
            swipingDirection: SwipingDirecton.None,
            layout: new Animated.ValueXY({ x: 0, y: 0 })
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

    private getSensivity(): number {
        return this.props.swipeSensivity || 1;
    }

    private handlePanResponderMove: GestureResponder<void> = (event, gesture) => {
        const swipingDirection = gesture.dx > 0 ? SwipingDirecton.Right : SwipingDirecton.Left;
        this.setState({ swipingDirection });
        this.state.layout.setValue({ x: gesture.dx, y: 0 });
    };

    private handlePanResponderEnd: GestureResponder<void> = (event, gesture) => {
        this.setState({ isResetting: true });
        Animated.timing(this.state.layout.x, { toValue: 0, duration: 300 }).start(() =>
            this.setState({ isResetting: false, swipingDirection: SwipingDirecton.None })
        );
    };

    private handleShouldSetPanResponder: GestureResponder<boolean> = (event, gesture) => {
        if (this.state.swipingDirection !== SwipingDirecton.None) {
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

    public render(): JSX.Element {
        const { children, style, ...props } = this.props;
        return (
            <View style={style}>
                {this.state.swipingDirection === SwipingDirecton.Right && (
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
                {this.state.swipingDirection === SwipingDirecton.Left && (
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
                    style={[{ backgroundColor: 'white' }, this.state.layout.getLayout()]}
                    {...this.panResponders.panHandlers}
                    {...props}
                >
                    {this.props.children}
                </Animated.View>
            </View>
        );
    }
}
