from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain_ollama import ChatOllama
from langchain.prompts import PromptTemplate


class DocChatBot:
	def __init__(self, model_name, chat_prompt, embedding_model):
		self.chat_model = model_name
		self.prompt = chat_prompt
		self.llm = ChatOllama(model=model_name, temperature=0,)
		self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
		self.chain = None
	#
	def change_model(self, new_model, model_type):
		self.chat_model = new_model
		self.llm = ChatOllama(model=self.chat_model, temperature=0,)
	#
	def change_prompt(self, new_prompt, prompt_type='file'):
		if prompt_type == 'file':
			with open('prompts/'+new_prompt, 'r') as prompt_file:
				self.prompt = ' '.join(prompt_file.readlines())
		else:
			self.prompt = new_prompt
	#
	def create_chat_chain(self, new_prompt, vectorstore):
		self.change_prompt(new_prompt, prompt_type='file')
		qa_prompt = PromptTemplate.from_template(template=self.prompt)
		retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 2})
		self.chain = ConversationalRetrievalChain.from_llm(llm=self.llm, retriever=retriever, return_source_documents=True,combine_docs_chain_kwargs={"prompt": qa_prompt}, verbose=True,)


