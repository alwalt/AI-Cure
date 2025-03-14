from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain.vectorstores import Chroma
import weaviate
import string
import random
import os
from langchain_weaviate.vectorstores import WeaviateVectorStore


class VectorGenerator:
	def __init__(self, embedding_model):
		self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
		self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
		self.save_directory="download_files/chroma_db"
	#
	def create_documents_from_images(self, image_jsons):
		data = []
		for i, (image_name, image_json) in enumerate(image_jsons.items()):
			data.append(Document(page_content=image_json["Summary"], metadata={"source": image_name}, id=i,))
		return data
	#
	def create_vector_store(self, data):
		split_docs = self.text_splitter.split_documents(data)
		vectorstore = Chroma.from_documents(documents=split_docs, embedding=self.embeddings, persist_directory=self.save_directory)
		return vectorstore
	#
	def create_vector_store_weaviate(self, data, weaviate_client, user_token):
		split_docs = self.text_splitter.split_documents(data)
		weaviate_client = weaviate.connect_to_local()
		vectorstore = WeaviateVectorStore.from_documents(split_docs, self.embeddings, index_name=user_token, client=weaviate_client)
		return vectorstore

def random_token():
	length = 13
	chars = string.ascii_letters + string.digits
	random.seed = (os.urandom(1024))
	return ''.join(random.choice(chars) for i in range(length))

