from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain.vectorstores import Chroma


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

