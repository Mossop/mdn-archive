FROM node:alpine

RUN mkdir -p /mdn-archive

ADD . /mdn-archive/
ADD https://github.com/mdn/archived-content/archive/refs/heads/main.tar.gz /mdn-archive/main.tar.gz

WORKDIR /mdn-archive

RUN \
  tar -xf main.tar.gz && \
  mv archived-content-main archived-content && \
  rm main.tar.gz && \
  yarn install --frozen-lockfile && \
  yarn build && \
  yarn cache clean

ENTRYPOINT ["node", "dist"]

EXPOSE 8000/tcp
