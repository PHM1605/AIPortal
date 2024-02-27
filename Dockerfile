FROM nikolaik/python-nodejs:python3.12-nodejs18

# RUN npm install -g yarn
COPY . ./
RUN pip install -r apiServer/requirements.txt
# RUN cd client && yarn && yarn build
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]