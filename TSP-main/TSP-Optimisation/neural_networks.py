import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import LSTM, Dense, Activation, Concatenate, Input, RepeatVector, TimeDistributed
from util import City, read_cities, path_cost
def build_pointer_network(seq_len, hidden_units):
    """ Builds the Pointer Network model. """
    # Inputs
    main_input = Input(shape=(seq_len, 2), name="main_input")

    # Encoder LSTM
    encoder_outputs = LSTM(hidden_units, return_sequences=True, name="encoder_lstm")(main_input)

    # Decoder LSTM
    decoder_lstm = LSTM(hidden_units, return_sequences=True, name="decoder_lstm")
    decoder_input = RepeatVector(seq_len)(encoder_outputs[:, -1, :])
    decoder_outputs, _, _ = decoder_lstm(decoder_input, initial_state=[encoder_outputs[:, -1, :], encoder_outputs[:, -1, :]])

    # Attention mechanism
    attention = Dense(1, activation='tanh')(Concatenate()([decoder_outputs, encoder_outputs]))
    attention = tf.keras.layers.Permute((2, 1))(attention)
    attention_output = Activation('softmax', name='attention_vec')(attention)
    pointer = tf.keras.layers.Permute((2, 1))(attention_output)

    # Adjust the output to match the target shape
    pointer = TimeDistributed(Dense(seq_len, activation='softmax'))(pointer)

    # Model
    model = Model(inputs=main_input, outputs=pointer)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model




def preprocess_data(cities):
    """ Prepares the input data for the model. """
    # Convert city objects to an array of coordinates
    coordinates = np.array([[city.x, city.y] for city in cities])
    # Normalize the coordinates
    coordinates -= np.mean(coordinates, axis=0)
    max_val = np.max(np.abs(coordinates))
    coordinates /= max_val
    return coordinates.reshape(1, -1, 2)  # Batch size of 1

if __name__ == "__main__":
    # Number of cities, adjust as necessary
    cities = read_cities(20)  # Assumes 'cities_20.data' exists and util.py is configured correctly

    # Model parameters
    seq_len = len(cities)
    hidden_units = 128

    # Build and summarize the model
    model = build_pointer_network(seq_len, hidden_units)
    model.summary()

    # Preprocess data
    data = preprocess_data(cities)

    # Dummy target (just for demonstration, should be replaced with actual optimal tours for training)
    targets = np.zeros((1, seq_len, seq_len))

    # Train the model (Note: In practice, you need actual optimal tours as targets for training)
    model.fit(data, targets, epochs=1)  # Set epochs to a suitable number for actual training
