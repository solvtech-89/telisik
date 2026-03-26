FROM node:20-alpine

# Accept build arguments for user/group IDs
ARG USER_ID=1000
ARG GROUP_ID=1000

# Accept build arguments
ARG VITE_API_BASE=http://localhost:8000
ARG VITE_WS_BASE=ws://localhost:8000

# Set as environment variables
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_WS_BASE=$VITE_WS_BASE

WORKDIR /app

# Create group if it doesn't exist, or use existing one
RUN GROUP_NAME=$(getent group ${GROUP_ID} | cut -d: -f1 || echo "") && \
    if [ -z "$GROUP_NAME" ]; then \
      addgroup -g ${GROUP_ID} telisik; \
      GROUP_NAME=telisik; \
    fi && \
    # Create user if it doesn't exist
    USER_NAME=$(getent passwd ${USER_ID} | cut -d: -f1 || echo "") && \
    if [ -z "$USER_NAME" ]; then \
      adduser -D -u ${USER_ID} -G $GROUP_NAME telisik; \
    fi && \
    # Change ownership of /app to the user
    chown -R ${USER_ID}:${GROUP_ID} /app

# Copy package files as root, then fix ownership
COPY package*.json ./
RUN chown ${USER_ID}:${GROUP_ID} package*.json

# Switch to the user
USER ${USER_ID}:${GROUP_ID}

# Install dependencies
RUN npm ci

# Copy project files (will be owned by the user)
COPY --chown=${USER_ID}:${GROUP_ID} . .

# Expose Vite dev server port
EXPOSE 5173

# Run dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]