FROM python:3.7
RUN mkdir /backend
COPY ./requirements.txt /backend/requirements.txt
RUN pip install -r backend/requirements.txt
COPY ./ backend
WORKDIR /backend