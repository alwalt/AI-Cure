import streamlit as st
from io import BytesIO
import base64
from PIL import Image
import numpy as np
import json

def image_container(uploaded_files):
	print('in image_container')
	if len(uploaded_files)>0:	
		check_for_files_updated(uploaded_files)	
		tabs = st.tabs(st.session_state.image_order)
		for i, image_name in enumerate(st.session_state.image_order):
			tabs[i].image(st.session_state.images[image_name]['img'], output_format="BGR")
			if image_name in st.session_state.jsons:
				tabs[i].write(f'JSON: {json.dumps(st.session_state.jsons[image_name])}')
		if len(st.session_state.pdf_order)>0:
			st.markdown("---")
			st.markdown("### PDF(s):")
			for pdf in st.session_state.pdf_order:
				st.markdown(f"- {pdf}")
	else:
		st.write('Please upload image(s) and/or PDFs')

def check_for_files_updated(uploaded_files):
	new_file_list = sorted([uploaded_file.name for uploaded_file in uploaded_files])
	old_file_list = sorted(st.session_state.image_order+st.session_state.pdf_order)
	if np.all(old_file_list!=new_file_list):
		print('Getting new files')
		for uploaded_file in uploaded_files:
			file_type = uploaded_file.name.split('.')[-1].upper()
			if file_type in ['PNG', 'JPG', 'JPEG']:
				st.session_state.images[uploaded_file.name] = {}
				image = Image.open(BytesIO(uploaded_file.read()))
				st.session_state.images[uploaded_file.name]['img'] = image
				st.session_state.images[uploaded_file.name]['img_base64'] = convert_to_base64(image)
			elif file_type == 'PDF':
				st.session_state.pdfs[uploaded_file.name] = uploaded_file
		#
		st.session_state.image_order = list(st.session_state.images.keys())
		st.session_state.pdf_order = list(st.session_state.pdfs.keys())

def next_step_action():
	if st.session_state.button_stage == 'Generate JSON(s)':
		st.session_state.make_jsons = True
		st.session_state.button_stage = 'Generate Vector DB'
	elif st.session_state.button_stage == 'Generate Vector DB':
		st.session_state.make_vector_db = True
		st.session_state.button_stage = 'Enter Chat'
	elif st.session_state.button_stage == 'Enter Chat':
		st.session_state.enter_chat = True

def convert_to_base64(pil_image):
	buffered = BytesIO()
	pil_image.save(buffered, format="JPEG")  # You can change the format if needed
	img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
	return img_str

def get_next_step_button():
	#if (len(st.session_state.jsons) == 0) and (len(st.session_state.images)>0):
	if len(st.session_state.images)>0:
		#if st.session_state.make_jsons == False:
		if len(st.session_state.vectorstore) == 0:
			next_step_button = st.button(st.session_state.button_stage, type="primary", on_click=next_step_action, disabled = False)
		elif st.session_state.enter_chat == False:
			button_cols = st.columns(2)
			download_button = button_cols[0].download_button('Download Vector DB', get_download_zip(), file_name='image_vectorstore_db.zip', type="primary")
			chat_button = button_cols[1].button(st.session_state.button_stage, type="primary", on_click=next_step_action, disabled = False)

def get_download_zip():
	with open("./download_files/chroma_db_test.zip", "rb") as zip_file:
		bytes = zip_file.read()
		zip_download_file = base64.b64encode(bytes).decode()
	return zip_download_file


def conversational_chat(query, chain):
	result = chain({"question": query, "chat_history": st.session_state['history']})
	st.session_state['history'].append((query, result["answer"]))
	return result["answer"]

