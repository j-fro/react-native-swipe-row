import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

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

export default class SwipeRow extends React.Component<SwipeRowProps> {}
