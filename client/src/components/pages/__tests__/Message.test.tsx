import 'react-native';

import * as ProfileContext from '../../../providers/ProfileModalProvider';

import {createTestElement, createTestProps} from '../../../../test/testUtils';
import {fireEvent, render} from '@testing-library/react-native';

import {Channel} from '../../../types/graphql';
import Message from '../Message';
import {MockPayloadGenerator} from 'relay-test-utils';
import React from 'react';
import {environment} from '../../../providers';

jest.mock('@react-navigation/core', () => {
  const Original = jest.requireActual('@react-navigation/core');

  return {
    ...Original,
    get useNavigation() {
      return jest.fn().mockImplementation(() => ({
        setOptions: jest.fn(),
      }));
    },
  };
});

const component = createTestElement(
  <Message
    {...createTestProps({
      route: {
        params: {
          user: {
            name: '',
          },
          channel: {
            id: '',
            name: '',
          },
        },
      },
    })}
  />,
);

jest.mock('expo-permissions', () => ({
  askAsync: (): string => 'granted',
}));

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: (): string => 'photo info',
  launchImageLibraryAsync: (): string => 'photo info',
}));

describe('[Message] rendering test', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    environment.mockClear();
  });

  it('renders as expected', () => {
    environment.mock.queueOperationResolver((operation) => {
      return MockPayloadGenerator.generate(operation, {
        Channel: (_, generateId): Partial<Channel> => ({
          id: `channel-${generateId()}`,
          name: 'John Doe',
        }),
      });
    });

    const json = render(component).toJSON();

    expect(json).toBeTruthy();
    expect(json).toMatchSnapshot();
  });
});

describe('[Message] interaction', () => {
  jest.useFakeTimers();

  it('should [sendMessage] when pressing button', () => {
    const {getByTestId} = render(component);
    const MessageBtn = getByTestId('btn-message');

    fireEvent.press(MessageBtn);
  });

  describe('dispatch showModal', () => {
    it('should dispatch [show-modal] when peerImage is pressed', async () => {
      const mockShowModal = jest.fn();

      jest
        .spyOn(ProfileContext, 'useProfileContext')
        .mockImplementation(() => ({
          showModal: mockShowModal,
          hideModal: jest.fn(),
          isVisible: false,
          modalState: null,
        }));

      const {getByTestId} = render(component);

      environment.mock.queueOperationResolver((op) =>
        MockPayloadGenerator.generate(op),
      );

      const messageListItem = getByTestId('message-list-item0');

      fireEvent.press(messageListItem);

      expect(mockShowModal).toBeCalledTimes(1);
    });
  });

  it('should open image library when pressing photo icon button', () => {
    const {getByTestId} = render(component);
    const touchMenu = getByTestId('touch-menu');

    fireEvent.press(touchMenu);

    jest.runAllTimers();

    const photoBtn = getByTestId('icon-photo');

    fireEvent.press(photoBtn);
  });

  it('should open camera when pressing camera icon button', async () => {
    const {getByTestId} = render(component);
    const touchMenu = getByTestId('touch-menu');

    fireEvent.press(touchMenu);

    jest.runAllTimers();

    const cameraBtn = getByTestId('icon-camera');

    fireEvent.press(cameraBtn);

    jest.runAllTimers();
  });
});
