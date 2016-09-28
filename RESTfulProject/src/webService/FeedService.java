package webService;

import java.util.ArrayList;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import javax.ws.rs.PathParam;  
import javax.ws.rs.core.Response;  

import model.ProjectManager;

import com.google.gson.Gson;

import dto.ChatObjects;
import dto.FeedObjects;

@Path("/WebService")
public class FeedService {
	
	
	@GET
	@Path("/GetHistory/{name}")
	@Produces("application/json")
	public String chatHistory(
			@PathParam("name") String name)
	{
		String feeds  = null;
		try 
		{
			ArrayList<ChatObjects> chatData = null;
			ProjectManager projectManager= new ProjectManager();
			chatData = projectManager.GetChats(name);
			//StringBuffer sb = new StringBuffer();
			Gson gson = new Gson();
			System.out.println(gson.toJson(chatData));
			feeds = gson.toJson(chatData);

		} catch (Exception e)
		{    e.printStackTrace();
			//System.out.println("error");
		}
		return feeds;
	}

	@GET
	@Path("/GetRole/{role}/{param}")
	@Produces("application/json")
	public String chatHistory(
			@PathParam("role") String name,
			@PathParam("param") String param)
	
	{
		String feeds  = null;
		try 
		{
			ArrayList<ChatObjects> chatData = null;
			ProjectManager projectManager= new ProjectManager();
			chatData = projectManager.GetChats(name);
			//StringBuffer sb = new StringBuffer();
			Gson gson = new Gson();
			System.out.println(gson.toJson(chatData));
			feeds = gson.toJson(chatData);

		} catch (Exception e)
		{    e.printStackTrace();
			//System.out.println("error");
		}
		return feeds;
	}

	
	
	@GET
	@Path("/delete/{name}")
	public Response delete(
			@PathParam("name") String name)
	{
		String feeds  = null;
		try 
		{
			
			ProjectManager projectManager= new ProjectManager();
			 projectManager.deleteChat( name);
		

		} catch (Exception e)
		{    e.printStackTrace();
			//System.out.println("error");
		}
		return Response.status(200)  
		        .entity("Rows Deleted for : " + name)  
		        .build(); 
	}

	
	
	 
	
	 @GET  
	 @Path("/insert/{name}/{email}/{role}/{bot}/{msg}")  
	 public Response getDate(  
			  @PathParam("name") String name,
			  @PathParam("email") String email,
			  @PathParam("msg") String msg,
			  @PathParam("bot") String bot,
			  @PathParam("role") String role
			 ) {  
		 
		 ProjectManager projectManager= new ProjectManager();
		 try {
			projectManager.insert(name,email,msg,Integer.parseInt(bot.trim()), role);
		} catch (Exception e) {
			
			e.printStackTrace();
		}
	   
	       return Response.status(200)  
	        .entity("inserted into  : ChatHistory"  )  
	        .build();  
	    }  
	 
	 @GET  
	 @Path("/update/{name}/{role}")  
	 public Response getDate(  
			  @PathParam("name") String name,
			  @PathParam("role") String role
			 ) {  
		 
		 ProjectManager projectManager= new ProjectManager();
		 try {
			projectManager.update(name, role);
		} catch (Exception e) {
			
			e.printStackTrace();
		}
	   
	       return Response.status(200)  
	        .entity("inserted into  : ChatHistory"  )  
	        .build();  
	    }  
}
