package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import dto.ChatObjects;
import dto.FeedObjects;
import dto.Objects;


public class Project {
	
	
	
	
	public void deleteChat(Connection conn,String name) throws Exception
	{
	
		
		
			String createQuery = "delete from ChatHistory where username = '"+name+"'";
			  
			   Statement stmt=null;
			try {
				 stmt=conn.createStatement();
				stmt.executeUpdate(createQuery);
				
			} catch (Exception e) {
			
				e.printStackTrace();
			}
		finally {
		      try {
		          
		          conn.close();        
		        } catch (SQLException e) {
		          e.printStackTrace();
		        }
		
	            }
	}

	
	public ArrayList<ChatObjects> GetChats(Connection conn , String name) throws Exception
	{
		ArrayList<ChatObjects> chatData = new ArrayList<ChatObjects>();
		PreparedStatement ps=null;
		try
		{
			//String uname = request.getParameter("uname");
			 ps = conn.prepareStatement("SELECT * FROM ChatHistory where username = '"+name+"'  ORDER BY id DESC ");
			//ps.setString(1,uname);
			ResultSet rs = ps.executeQuery();
			while(rs.next())
			{
				ChatObjects chatObject = new ChatObjects();
				chatObject.setId(rs.getString("id"));
				chatObject.setEmail(rs.getString("email"));
				chatObject.setUsername(rs.getString("username"));
				chatObject.setTime(rs.getString("time"));
				chatObject.setMessage(rs.getString("message"));
				chatObject.setSender(rs.getString("sender"));
				chatObject.setRole(rs.getString("role"));
				chatData.add(chatObject);
			}
			
			
			
			
			return chatData;
		}
		catch(Exception e)
		{
			throw e;
		}finally {
		      try {
		          ps.close();
		          conn.close();        
		        } catch (SQLException e) {
		          e.printStackTrace();
		        }
		
	            }
	}
	
	
	public void insert(Connection conn,String name,String email,String msg, int bot,String role ){
	
		String insertQuery = null;
		
		System.out.println(bot + role);
		if(bot==0){
		    insertQuery = "insert into  ChatHistory(username,email,message,sender,role) values('"
	        +name+"','"+email+"','"+msg+"','"+name+"','"+role+"')";
		}
		else{
			
			insertQuery = "insert into  ChatHistory(username,email,message,sender,role) values('"
		        +name+"','"+email+"','"+msg+"','bot','0')";
			
		}  
		
		   	   
		   Statement stmt=null;
		try {
			 stmt=conn.createStatement();
			stmt.executeUpdate(insertQuery);
			
		} catch (Exception e) {
		
			e.printStackTrace();
		}finally {
		      try {
		          stmt.close();
		          conn.close();        
		        } catch (SQLException e) {
		          e.printStackTrace();
		        }
		
	            }
	
    }
	public void update(Connection conn,String name,String role ){
		
		String insertQuery = null;
		
		
		    insertQuery = "update  ChatHistory set role='"
		    		     +role+"' where username= '"+name+"'";
		
		   	   
		   Statement stmt=null;
		try {
			 stmt=conn.createStatement();
			stmt.executeUpdate(insertQuery);
			
		} catch (Exception e) {
		
			e.printStackTrace();
		}finally {
		      try {
		          stmt.close();
		          conn.close();        
		        } catch (SQLException e) {
		          e.printStackTrace();
		        }
		
	            }
	
    }
	
}
