package model;

import java.sql.Connection;
import java.util.ArrayList;

import dao.Database;

import dao.Project;
import dto.ChatObjects;
import dto.FeedObjects;

public class ProjectManager {
	
	
	
	
	
	public ArrayList<ChatObjects> GetChats(String name)throws Exception {
		ArrayList<ChatObjects> chats = null;
		try {
			    Database database= new Database();
			    Connection connection = database.Get_Connection();
				Project project= new Project();
				chats=project.GetChats(connection,name);
		//connection.commit();
		} catch (Exception e) {
			throw e;
		}
		return chats;
	}
	
	
	public void deleteChat(String name)throws Exception {
		
		try {
			    Database database= new Database();
			    Connection connection = database.Get_Connection();
				Project project= new Project();
				project.deleteChat(connection, name);
		
		} catch (Exception e) {
			 e.printStackTrace();
			 throw e;
		}
		
	}
	
	
    
	public void insert (String name,String email,String msg,int bot,String role)throws Exception {
		
		try {
			    Database database= new Database();
			    Connection connection = database.Get_Connection();
				Project project= new Project();
				project.insert(connection,  name,email,msg,bot,role);
				//connection.commit();
		
		} catch (Exception e) {
			 e.printStackTrace();
			 throw e;
		}
		
	}

public void update (String name,String role)throws Exception {
		
		try {
			    Database database= new Database();
			    Connection connection = database.Get_Connection();
				Project project= new Project();
				project.update(connection,  name,role);
				//connection.commit();
		
		} catch (Exception e) {
			 e.printStackTrace();
			 throw e;
		}
		
	}

}
